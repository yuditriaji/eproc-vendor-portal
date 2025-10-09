'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import {
  Layout,
  Card,
  Typography,
  Button,
  Input,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Alert,
  Avatar,
  Dropdown,
  Badge,
  Progress,
  Empty,
  Spin,
  Divider,
  Tooltip,
  notification
} from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  WarningOutlined,
  DollarOutlined,
  CalendarOutlined,
  TagOutlined
} from '@ant-design/icons'
import {
  useGetTendersQuery,
  useLogoutMutation,
  useGetBidsQuery
} from '@/store/api/procurementApi'
import { selectIsAuthenticated, selectUser, logout } from '@/store/slices/authSlice'
import VendorLayout from '@/components/layout/VendorLayout'

const { Header, Content } = Layout
const { Title, Text } = Typography
const { Search } = Input

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getDaysRemaining = (closingDate: string) => {
  const now = new Date()
  const closing = new Date(closingDate)
  const diffTime = closing.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'published':
    case 'open':
      return 'success'
    case 'closed':
      return 'default'
    case 'draft':
      return 'warning'
    default:
      return 'processing'
  }
}

export default function VendorDashboard() {
  const router = useRouter()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const [logoutMutation] = useLogoutMutation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const {
    data: tendersData,
    error: tendersError,
    isLoading: tendersLoading,
    refetch: refetchTenders
  } = useGetTendersQuery({
    status: 'PUBLISHED',
    limit: 20,
    offset: 0
  })

  const {
    data: userBidsData,
    isLoading: bidsLoading
  } = useGetBidsQuery({
    limit: 10,
    offset: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/vendor/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
      notification.success({
        message: 'Logged Out',
        description: 'You have been successfully logged out.'
      })
      router.push('/vendor/login')
    } catch (error) {
      dispatch(logout())
      router.push('/vendor/login')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  // Process data
  const tenders = tendersData || []
  const userBids = userBidsData || []

  // Calculate metrics
  const totalTenders = tenders.length
  const urgentTenders = tenders.filter(tender => {
    const daysRemaining = getDaysRemaining(tender.closingDate)
    return daysRemaining <= 3 && daysRemaining > 0
  }).length
  const activeBids = userBids.filter(bid => 
    bid.status === 'DRAFT' || bid.status === 'SUBMITTED'
  ).length
  const wonContracts = userBids.filter(bid => 
    bid.status === 'ACCEPTED'
  ).length

  // Filter tenders
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.category?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || tender.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // User menu items
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile'
    },
    {
      key: 'settings',
      icon: <EditOutlined />,
      label: 'Settings'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ]

  // Tender table columns
  const tenderColumns = [
    {
      title: 'Tender Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div>
          <Text strong className="block">{text}</Text>
          <Text type="secondary" className="text-sm block mt-1">
            ID: #{record.id.slice(-6).toUpperCase()}
          </Text>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag icon={<TagOutlined />} color="blue">{category}</Tag>
      )
    },
    {
      title: 'Value',
      dataIndex: 'estimatedValue',
      key: 'estimatedValue',
      render: (value: number) => (
        <Text strong>{value ? formatCurrency(value) : 'N/A'}</Text>
      )
    },
    {
      title: 'Closing Date',
      dataIndex: 'closingDate',
      key: 'closingDate',
      render: (date: string) => {
        const daysRemaining = getDaysRemaining(date)
        const isUrgent = daysRemaining <= 3 && daysRemaining > 0
        const isClosed = daysRemaining <= 0
        
        return (
          <div>
            <Text className="block">{formatDate(date)}</Text>
            <Text 
              className={`text-sm ${
                isClosed ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-green-500'
              }`}
            >
              {isClosed ? 'Closed' : `${daysRemaining} days left`}
            </Text>
          </div>
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        const daysRemaining = getDaysRemaining(record.closingDate)
        const isClosed = daysRemaining <= 0
        
        return (
          <Space>
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewTender(record)}
            >
              View
            </Button>
            {record.status === 'PUBLISHED' && !isClosed && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => handleSubmitBid(record)}
              >
                Bid
              </Button>
            )}
          </Space>
        )
      }
    }
  ]

  const handleViewTender = (tender: any) => {
    console.log('View tender:', tender)
    // Navigate to tender details
  }

  const handleSubmitBid = (tender: any) => {
    console.log('Submit bid:', tender)
    router.push(`/vendor/bids/submit?tender=${tender.id}`)
  }

  return (
    <VendorLayout>
      <div className="p-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <div className="mb-8">
            <Title level={2} className="!mb-2">
              Welcome back, {user?.name || 'Vendor'}! 👋
            </Title>
            <Text type="secondary" className="text-base">
              Monitor tenders, manage bids, and track your procurement opportunities.
            </Text>
          </div>

          {/* Urgent Alert */}
          {urgentTenders > 0 && (
            <Alert
              message="Urgent Action Required"
              description={`You have ${urgentTenders} tender${urgentTenders > 1 ? 's' : ''} closing within 3 days.`}
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              closable
              className="mb-6"
            />
          )}

          {/* Statistics Cards */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Available Tenders"
                  value={totalTenders}
                  prefix={<FileTextOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Text type="secondary" className="text-sm">
                  Total published tenders
                </Text>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Closing Soon"
                  value={urgentTenders}
                  prefix={<ClockCircleOutlined className="text-orange-500" />}
                  valueStyle={{ color: urgentTenders > 0 ? '#fa8c16' : '#1890ff' }}
                />
                <Text type="secondary" className="text-sm">
                  Tenders closing in 3 days
                </Text>
                {urgentTenders > 0 && (
                  <Tag color="orange" className="mt-2 text-xs">
                    Action Required
                  </Tag>
                )}
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Active Bids"
                  value={activeBids}
                  prefix={<EditOutlined className="text-green-500" />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary" className="text-sm">
                  Your submitted bids
                </Text>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Won Contracts"
                  value={wonContracts}
                  prefix={<TrophyOutlined className="text-purple-500" />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Text type="secondary" className="text-sm">
                  Successful bids
                </Text>
                {wonContracts > 0 && (
                  <Tag color="green" className="mt-2 text-xs">
                    Great Performance!
                  </Tag>
                )}
              </Card>
            </Col>
          </Row>

          {/* Tenders Section */}
          <Card className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <Title level={3} className="!mb-1">
                  Available Tenders
                </Title>
                <Text type="secondary">
                  Browse and submit bids for published procurement opportunities
                </Text>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Search
                  placeholder="Search tenders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: 300 }}
                  size="large"
                />
                
                <Space>
                  <Button 
                    icon={<FilterOutlined />} 
                    size="large"
                  >
                    Filters
                  </Button>
                  <Button size="large">
                    Export
                  </Button>
                </Space>
              </div>
            </div>

            {/* Quick Filter Tags */}
            {(urgentTenders > 0 || totalTenders > 0) && (
              <div className="mb-6">
                <Text type="secondary" className="mr-3">Quick filters:</Text>
                <Space wrap>
                  {urgentTenders > 0 && (
                    <Tag 
                      color="orange" 
                      icon={<ClockCircleOutlined />}
                      className="cursor-pointer"
                    >
                      Closing Soon ({urgentTenders})
                    </Tag>
                  )}
                  <Tag 
                    color="blue" 
                    className="cursor-pointer"
                  >
                    All Tenders ({totalTenders})
                  </Tag>
                  <Tag 
                    color="green" 
                    icon={<DollarOutlined />}
                    className="cursor-pointer"
                  >
                    High Value
                  </Tag>
                </Space>
              </div>
            )}

            {/* Tenders Table */}
            <Table
              columns={tenderColumns}
              dataSource={filteredTenders}
              loading={tendersLoading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} tenders`
              }}
              locale={{
                emptyText: searchQuery ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No matching tenders found"
                  >
                    <Button type="primary" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </Empty>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No tenders available"
                  />
                )
              }}
              scroll={{ x: true }}
            />
          </Card>
        </div>
      </div>
    </VendorLayout>
  )
}
