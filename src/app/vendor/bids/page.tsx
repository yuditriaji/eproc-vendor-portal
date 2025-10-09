'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import {
  Layout,
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Breadcrumb,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Timeline,
  Progress,
  Tabs,
  List,
  Avatar,
  Drawer,
  Badge,
  Empty,
  Tooltip,
  Divider,
  Alert,
  message
} from 'antd'
import {
  FileTextOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  SendOutlined,
  HomeOutlined,
  FilterOutlined,
  ReloadOutlined,
  TrophyOutlined,
  StarOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useGetBidsQuery } from '@/store/api/procurementApi'
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice'
import VendorLayout from '@/components/layout/VendorLayout'

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

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

const getBidStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DRAFT':
      return 'default'
    case 'SUBMITTED':
      return 'processing'
    case 'UNDER_REVIEW':
      return 'warning'
    case 'SCORED':
      return 'cyan'
    case 'ACCEPTED':
    case 'AWARDED':
      return 'success'
    case 'REJECTED':
      return 'error'
    default:
      return 'default'
  }
}

const getBidStatusText = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DRAFT':
      return 'Draft'
    case 'SUBMITTED':
      return 'Submitted'
    case 'UNDER_REVIEW':
      return 'Under Review'
    case 'SCORED':
      return 'Scored'
    case 'ACCEPTED':
    case 'AWARDED':
      return 'Awarded'
    case 'REJECTED':
      return 'Rejected'
    default:
      return status
  }
}

export default function BidsPage() {
  const router = useRouter()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  
  // State management
  const [selectedBid, setSelectedBid] = useState<any>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // API calls
  const {
    data: bidsData,
    error: bidsError,
    isLoading: bidsLoading,
    refetch: refetchBids
  } = useGetBidsQuery({
    limit: 50,
    offset: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/vendor/login')
    }
  }, [isAuthenticated, router])

  // Process data
  const allBids = bidsData || []
  
  // Filter bids
  const filteredBids = allBids.filter(bid => {
    if (statusFilter === 'ALL') return true
    return bid.status?.toUpperCase() === statusFilter
  })

  // Calculate statistics
  const stats = {
    total: allBids.length,
    draft: allBids.filter(b => b.status?.toUpperCase() === 'DRAFT').length,
    submitted: allBids.filter(b => b.status?.toUpperCase() === 'SUBMITTED').length,
    awarded: allBids.filter(b => ['ACCEPTED', 'AWARDED'].includes(b.status?.toUpperCase())).length,
    rejected: allBids.filter(b => b.status?.toUpperCase() === 'REJECTED').length
  }

  // Bid table columns
  const columns = [
    {
      title: 'Tender Information',
      key: 'tender',
      render: (record: any) => (
        <div>
          <Title level={5} className="!mb-1">
            {record.tender?.title || 'N/A'}
          </Title>
          <Text type="secondary" className="text-sm">
            Bid ID: #{record.id.slice(-6).toUpperCase()}
          </Text>
          <div className="mt-2">
            <Tag icon={<FileTextOutlined />} color="blue">
              {record.tender?.category || 'General'}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Bid Amount',
      key: 'amount',
      render: (record: any) => {
        const amount = record.bidAmount || record.proposedAmount || 0
        return (
          <div>
            <Text strong className="text-lg">
              {formatCurrency(amount)}
            </Text>
            <br />
            <Text type="secondary" className="text-xs">
              Total Bid Value
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
        <Tag color={getBidStatusColor(status)}>
          {getBidStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Timeline',
      key: 'timeline',
      render: (record: any) => {
        const created = formatDate(record.createdAt)
        const submitted = record.submittedAt ? formatDate(record.submittedAt) : null
        const closingDate = record.tender?.closingDate
        const daysLeft = closingDate ? getDaysRemaining(closingDate) : null
        
        return (
          <div>
            <div className="mb-1">
              <CalendarOutlined className="mr-1" />
              <Text className="text-sm">Created: {created}</Text>
            </div>
            {submitted && (
              <div className="mb-1">
                <CheckCircleOutlined className="mr-1 text-green-500" />
                <Text className="text-sm">Submitted: {submitted}</Text>
              </div>
            )}
            {daysLeft !== null && daysLeft >= 0 && (
              <div>
                <ClockCircleOutlined className="mr-1" />
                <Text className={`text-sm ${
                  daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-orange-500' : 'text-green-500'
                }`}>
                  {daysLeft === 0 ? 'Closes today' : `${daysLeft} days left`}
                </Text>
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewBid(record)}
            />
          </Tooltip>
          {record.status?.toUpperCase() === 'DRAFT' && (
            <Tooltip title="Edit Bid">
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => handleEditBid(record)}
              />
            </Tooltip>
          )}
          {['DRAFT', 'SUBMITTED'].includes(record.status?.toUpperCase()) && (
            <Tooltip title="Resubmit">
              <Button 
                type="text" 
                icon={<SendOutlined />}
                onClick={() => handleResubmitBid(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  // Event handlers
  const handleViewBid = (bid: any) => {
    setSelectedBid(bid)
    setDrawerVisible(true)
  }

  const handleEditBid = (bid: any) => {
    message.info('Edit functionality would redirect to bid form')
    // router.push(`/vendor/bids/edit/${bid.id}`)
  }

  const handleResubmitBid = (bid: any) => {
    Modal.confirm({
      title: 'Resubmit Bid',
      content: 'Are you sure you want to resubmit this bid?',
      onOk: async () => {
        try {
          message.success('Bid resubmitted successfully!')
          refetchBids()
        } catch (error) {
          message.error('Failed to resubmit bid')
        }
      }
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <VendorLayout>
      <div className="p-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-7xl mx-auto w-full">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <Breadcrumb.Item href="/vendor/dashboard">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/vendor/dashboard">
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item>My Bids</Breadcrumb.Item>
          </Breadcrumb>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <Title level={2} className="!mb-1">
                My Bids
              </Title>
              <Text type="secondary">
                Manage and track your submitted bids
              </Text>
            </div>
            
            <Space>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                size="large"
              >
                <Option value="ALL">All Status</Option>
                <Option value="DRAFT">Draft</Option>
                <Option value="SUBMITTED">Submitted</Option>
                <Option value="UNDER_REVIEW">Under Review</Option>
                <Option value="SCORED">Scored</Option>
                <Option value="ACCEPTED">Awarded</Option>
                <Option value="REJECTED">Rejected</Option>
              </Select>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => refetchBids()}
                size="large"
              >
                Refresh
              </Button>
              <Button 
                type="primary" 
                href="/vendor/tenders"
                size="large"
              >
                Browse Tenders
              </Button>
            </Space>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={12} sm={6} lg={4}>
              <Card size="small">
                <Statistic
                  title="Total Bids"
                  value={stats.total}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Card size="small">
                <Statistic
                  title="Draft"
                  value={stats.draft}
                  prefix={<EditOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Card size="small">
                <Statistic
                  title="Submitted"
                  value={stats.submitted}
                  prefix={<SendOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Card size="small">
                <Statistic
                  title="Awarded"
                  value={stats.awarded}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <Card size="small">
                <Statistic
                  title="Rejected"
                  value={stats.rejected}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Performance Alert */}
          {stats.awarded > 0 && (
            <Alert
              message="Congratulations!"
              description={`You have won ${stats.awarded} contract${stats.awarded > 1 ? 's' : ''}. Keep up the excellent work!`}
              type="success"
              icon={<TrophyOutlined />}
              showIcon
              closable
              className="mb-6"
            />
          )}

          {/* Bids Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredBids}
              loading={bidsLoading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} bids`
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      statusFilter !== 'ALL' ? 
                        `No ${statusFilter.toLowerCase()} bids found` : 
                        "You haven't submitted any bids yet"
                    }
                  >
                    {statusFilter !== 'ALL' ? (
                      <Button type="primary" onClick={() => setStatusFilter('ALL')}>
                        Show All Bids
                      </Button>
                    ) : (
                      <Button type="primary" href="/vendor/tenders">
                        Browse Tenders
                      </Button>
                    )}
                  </Empty>
                )
              }}
              scroll={{ x: true }}
            />
          </Card>

          {/* Bid Details Drawer */}
          <Drawer
            title="Bid Details"
            placement="right"
            size="large"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={800}
          >
            {selectedBid && (
              <div>
                <div className="mb-6">
                  <Title level={3}>{selectedBid.tender?.title || 'N/A'}</Title>
                  <Text type="secondary">
                    Bid ID: #{selectedBid.id.slice(-6).toUpperCase()}
                  </Text>
                </div>

                <Tabs defaultActiveKey="overview">
                  <TabPane tab="Overview" key="overview">
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Status">
                        <Tag color={getBidStatusColor(selectedBid.status)}>
                          {getBidStatusText(selectedBid.status)}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Bid Amount">
                        <Text strong>
                          {formatCurrency(selectedBid.bidAmount || 0)}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Created Date">
                        {formatDate(selectedBid.createdAt)}
                      </Descriptions.Item>
                      {selectedBid.submittedAt && (
                        <Descriptions.Item label="Submitted Date">
                          {formatDate(selectedBid.submittedAt)}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Tender Category">
                        <Tag icon={<FileTextOutlined />} color="blue">
                          {selectedBid.tender?.category || 'General'}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Title level={4}>Technical Proposal</Title>
                    <Text>
                      {selectedBid.proposal || 'No technical proposal provided.'}
                    </Text>
                  </TabPane>

                  <TabPane tab="Timeline" key="timeline">
                    <Timeline>
                      <Timeline.Item color="blue">
                        <div>
                          <FileTextOutlined className="mr-2" />
                          <Text strong>Bid Created</Text>
                        </div>
                        <Text type="secondary">{formatDate(selectedBid.createdAt)}</Text>
                      </Timeline.Item>
                      
                      {selectedBid.submittedAt && (
                        <Timeline.Item color="green">
                          <div>
                            <SendOutlined className="mr-2" />
                            <Text strong>Bid Submitted</Text>
                          </div>
                          <Text type="secondary">{formatDate(selectedBid.submittedAt)}</Text>
                        </Timeline.Item>
                      )}
                      
                      {selectedBid.status === 'UNDER_REVIEW' && (
                        <Timeline.Item color="orange">
                          <div>
                            <ClockCircleOutlined className="mr-2" />
                            <Text strong>Under Review</Text>
                          </div>
                          <Text type="secondary">Being evaluated by procurement team</Text>
                        </Timeline.Item>
                      )}
                      
                      {selectedBid.status === 'ACCEPTED' && (
                        <Timeline.Item color="green">
                          <div>
                            <TrophyOutlined className="mr-2" />
                            <Text strong>Bid Awarded</Text>
                          </div>
                          <Text type="secondary">Congratulations! Your bid was successful.</Text>
                        </Timeline.Item>
                      )}
                      
                      {selectedBid.status === 'REJECTED' && (
                        <Timeline.Item color="red">
                          <div>
                            <ExclamationCircleOutlined className="mr-2" />
                            <Text strong>Bid Rejected</Text>
                          </div>
                          <Text type="secondary">Unfortunately, your bid was not selected.</Text>
                        </Timeline.Item>
                      )}
                    </Timeline>
                  </TabPane>

                  <TabPane tab="Documents" key="documents">
                    <List
                      dataSource={[
                        { name: 'Bid Proposal.pdf', size: '1.2 MB' },
                        { name: 'Technical Specifications.docx', size: '856 KB' },
                        { name: 'Company Profile.pdf', size: '2.1 MB' }
                      ]}
                      renderItem={(doc) => (
                        <List.Item
                          actions={[
                            <Button key="download" type="link">
                              Download
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<FileTextOutlined />} />}
                            title={doc.name}
                            description={doc.size}
                          />
                        </List.Item>
                      )}
                    />
                  </TabPane>
                </Tabs>

                <div className="mt-6 flex justify-end space-x-2">
                  <Button onClick={() => setDrawerVisible(false)}>
                    Close
                  </Button>
                  {selectedBid.status === 'DRAFT' && (
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />}
                      onClick={() => handleEditBid(selectedBid)}
                    >
                      Edit Bid
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Drawer>
        </div>
      </div>
    </VendorLayout>
  )
}
