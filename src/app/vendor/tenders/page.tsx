'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import {
  Layout,
  Card,
  Typography,
  Button,
  Input,
  Row,
  Col,
  Select,
  Table,
  Tag,
  Space,
  Drawer,
  Descriptions,
  Divider,
  Breadcrumb,
  Badge,
  Modal,
  Form,
  InputNumber,
  Upload,
  DatePicker,
  message,
  Tooltip,
  Progress,
  Timeline,
  Tabs,
  List,
  Avatar,
  Rate,
  Statistic
} from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  PlusOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  TagOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  HomeOutlined,
  UserOutlined,
  StarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { useGetTendersQuery } from '@/store/api/procurementApi'
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice'
import VendorLayout from '@/components/layout/VendorLayout'

const { Content } = Layout
const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { TabPane } = Tabs
const { TextArea } = Input

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

const getPriorityColor = (days: number) => {
  if (days <= 1) return 'error'
  if (days <= 3) return 'warning'
  if (days <= 7) return 'processing'
  return 'success'
}

export default function TenderBrowsingPage() {
  const router = useRouter()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [valueRange, setValueRange] = useState<[number, number] | null>(null)
  const [selectedTender, setSelectedTender] = useState<any>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [bidModalVisible, setBidModalVisible] = useState(false)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Form instances
  const [bidForm] = Form.useForm()

  // API calls
  const {
    data: tendersData,
    error: tendersError,
    isLoading: tendersLoading,
    refetch: refetchTenders
  } = useGetTendersQuery({
    status: 'PUBLISHED',
    limit: 50,
    offset: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/vendor/login')
    }
  }, [isAuthenticated, router])

  // Process data
  const tenders = tendersData || []

  // Filter logic
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.category?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || tender.category === selectedCategory
    
    const matchesValue = !valueRange || 
      (tender.estimatedValue >= valueRange[0] && tender.estimatedValue <= valueRange[1])
    
    return matchesSearch && matchesCategory && matchesValue
  })

  // Get unique categories
  const categories = Array.from(new Set(tenders.map(t => t.category).filter(Boolean)))

  // Tender table columns
  const columns = [
    {
      title: 'Tender Details',
      key: 'details',
      render: (record: any) => {
        const daysRemaining = getDaysRemaining(record.closingDate)
        const isUrgent = daysRemaining <= 3
        
        return (
          <div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Title level={5} className="!mb-1">
                  {record.title}
                </Title>
                <Text type="secondary" className="text-sm">
                  ID: #{record.id.slice(-6).toUpperCase()}
                </Text>
              </div>
              {isUrgent && (
                <Badge 
                  count={<WarningOutlined />} 
                  style={{ backgroundColor: '#fa8c16' }}
                />
              )}
            </div>
            <Paragraph 
              className="text-sm mt-2 mb-0" 
              ellipsis={{ rows: 2 }}
            >
              {record.description}
            </Paragraph>
          </div>
        )
      }
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: string) => (
        <Tag icon={<TagOutlined />} color="blue">{category}</Tag>
      )
    },
    {
      title: 'Value',
      dataIndex: 'estimatedValue',
      key: 'estimatedValue',
      width: 120,
      sorter: (a: any, b: any) => a.estimatedValue - b.estimatedValue,
      render: (value: number) => (
        <Statistic
          value={value}
          formatter={(val) => formatCurrency(Number(val))}
          valueStyle={{ fontSize: '14px' }}
        />
      )
    },
    {
      title: 'Timeline',
      key: 'timeline',
      width: 160,
      render: (record: any) => {
        const daysRemaining = getDaysRemaining(record.closingDate)
        const isClosed = daysRemaining <= 0
        const priority = getPriorityColor(daysRemaining)
        
        return (
          <div>
            <div className="mb-1">
              <Text className="text-sm block">{formatDate(record.closingDate)}</Text>
            </div>
            <Progress 
              percent={isClosed ? 100 : Math.max(0, Math.min(100, (30 - daysRemaining) / 30 * 100))}
              size="small"
              status={isClosed ? 'exception' : priority === 'error' ? 'exception' : 'active'}
              strokeColor={priority === 'error' ? '#ff4d4f' : priority === 'warning' ? '#fa8c16' : '#52c41a'}
            />
            <Text 
              className={`text-xs ${
                isClosed ? 'text-red-500' : 
                priority === 'error' ? 'text-red-500' : 
                priority === 'warning' ? 'text-orange-500' : 'text-green-500'
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
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (record: any) => {
        const daysRemaining = getDaysRemaining(record.closingDate)
        const isClosed = daysRemaining <= 0
        
        return (
          <Space>
            <Tooltip title="View Details">
              <Button 
                type="text" 
                icon={<EyeOutlined />}
                onClick={() => handleViewTender(record)}
              />
            </Tooltip>
            {record.status === 'PUBLISHED' && !isClosed && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                size="small"
                onClick={() => handleStartBid(record)}
              >
                Bid
              </Button>
            )}
          </Space>
        )
      }
    }
  ]

  // Event handlers
  const handleViewTender = (tender: any) => {
    setSelectedTender(tender)
    setDrawerVisible(true)
  }

  const handleStartBid = (tender: any) => {
    setSelectedTender(tender)
    setBidModalVisible(true)
    bidForm.resetFields()
  }

  const handleSubmitBid = async (values: any) => {
    try {
      console.log('Submitting bid:', { tender: selectedTender.id, ...values })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('Bid submitted successfully!')
      setBidModalVisible(false)
      setSelectedTender(null)
      
      // Redirect to bids page to view submission
      router.push('/vendor/bids')
      
    } catch (error) {
      message.error('Failed to submit bid. Please try again.')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setValueRange(null)
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
            <Breadcrumb.Item>Tenders</Breadcrumb.Item>
          </Breadcrumb>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <Title level={2} className="!mb-1">
                Browse Tenders
              </Title>
              <Text type="secondary">
                Discover and bid on procurement opportunities
              </Text>
            </div>
            
            <Space>
              <Button icon={<FilterOutlined />} onClick={() => setFiltersVisible(!filtersVisible)}>
                {filtersVisible ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button type="primary" href="/vendor/dashboard">
                Back to Dashboard
              </Button>
            </Space>
          </div>

          {/* Filters */}
          {filtersVisible && (
            <Card className="mb-6">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Search
                    placeholder="Search tenders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="large"
                  />
                </Col>
                <Col xs={24} md={6}>
                  <Select
                    placeholder="Category"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    size="large"
                    className="w-full"
                  >
                    <Option value="all">All Categories</Option>
                    {categories.map(category => (
                      <Option key={category} value={category}>{category}</Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} md={6}>
                  <InputNumber
                    placeholder="Min Value"
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                    onChange={(value) => setValueRange(prev => [Number(value) || 0, prev?.[1] || Infinity])}
                    size="large"
                    className="w-full"
                  />
                </Col>
                <Col xs={24} md={4}>
                  <Button onClick={clearFilters} size="large" className="w-full">
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            </Card>
          )}

          {/* Stats */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Total Tenders"
                  value={filteredTenders.length}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Closing Soon"
                  value={filteredTenders.filter(t => getDaysRemaining(t.closingDate) <= 3).length}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="High Value"
                  value={filteredTenders.filter(t => t.estimatedValue > 100000).length}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Categories"
                  value={categories.length}
                  prefix={<TagOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Tenders Table */}
          <Card>
            <Table
              columns={columns}
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
              scroll={{ x: true }}
            />
          </Card>

          {/* Tender Details Drawer */}
          <Drawer
            title="Tender Details"
            placement="right"
            size="large"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={800}
          >
            {selectedTender && (
              <div>
                <div className="mb-6">
                  <Title level={3}>{selectedTender.title}</Title>
                  <Text type="secondary">
                    Tender ID: #{selectedTender.id.slice(-6).toUpperCase()}
                  </Text>
                </div>

                <Tabs defaultActiveKey="overview">
                  <TabPane tab="Overview" key="overview">
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Status">
                        <Tag color={getStatusColor(selectedTender.status)}>
                          {selectedTender.status}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Category">
                        <Tag icon={<TagOutlined />} color="blue">
                          {selectedTender.category}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Estimated Value">
                        <Text strong>
                          {formatCurrency(selectedTender.estimatedValue)}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Closing Date">
                        <div>
                          <CalendarOutlined className="mr-2" />
                          {formatDate(selectedTender.closingDate)}
                          <Tag 
                            color={getPriorityColor(getDaysRemaining(selectedTender.closingDate))}
                            className="ml-2"
                          >
                            {getDaysRemaining(selectedTender.closingDate)} days left
                          </Tag>
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Published Date">
                        {formatDate(selectedTender.createdAt)}
                      </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Title level={4}>Description</Title>
                    <Paragraph>
                      {selectedTender.description}
                    </Paragraph>
                  </TabPane>

                  <TabPane tab="Requirements" key="requirements">
                    <List
                      dataSource={[
                        'Valid business license',
                        'Minimum 3 years experience',
                        'ISO certification preferred',
                        'Financial capacity documentation'
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <CheckCircleOutlined className="text-green-500 mr-2" />
                          {item}
                        </List.Item>
                      )}
                    />
                  </TabPane>

                  <TabPane tab="Documents" key="documents">
                    <List
                      dataSource={[
                        { name: 'Tender Specifications.pdf', size: '2.4 MB' },
                        { name: 'Terms and Conditions.pdf', size: '1.1 MB' },
                        { name: 'Technical Requirements.docx', size: '856 KB' }
                      ]}
                      renderItem={(doc) => (
                        <List.Item
                          actions={[
                            <Button 
                              key="download" 
                              type="link" 
                              icon={<DownloadOutlined />}
                            >
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
                  {selectedTender.status === 'PUBLISHED' && 
                   getDaysRemaining(selectedTender.closingDate) > 0 && (
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setDrawerVisible(false)
                        handleStartBid(selectedTender)
                      }}
                    >
                      Submit Bid
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Drawer>

          {/* Bid Submission Modal */}
          <Modal
            title={`Submit Bid - ${selectedTender?.title}`}
            open={bidModalVisible}
            onCancel={() => setBidModalVisible(false)}
            footer={null}
            width={700}
          >
            <Form
              form={bidForm}
              layout="vertical"
              onFinish={handleSubmitBid}
              autoComplete="off"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="bidAmount"
                    label="Bid Amount"
                    rules={[
                      { required: true, message: 'Please enter bid amount!' },
                      { type: 'number', min: 1, message: 'Amount must be greater than 0!' }
                    ]}
                  >
                    <InputNumber
                      size="large"
                      formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      placeholder="Enter your bid amount"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="deliveryDays"
                    label="Delivery Timeline (Days)"
                    rules={[
                      { required: true, message: 'Please specify delivery timeline!' },
                      { type: 'number', min: 1, message: 'Timeline must be at least 1 day!' }
                    ]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="Number of days"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="proposal"
                label="Technical Proposal"
                rules={[
                  { required: true, message: 'Please provide your technical proposal!' },
                  { min: 100, message: 'Proposal must be at least 100 characters!' }
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Describe your approach, methodology, and why you're the best fit for this tender..."
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="documents"
                label="Supporting Documents"
              >
                <Upload.Dragger
                  multiple
                  beforeUpload={() => false}
                  maxCount={5}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag files to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for multiple files. Maximum 5 files.
                  </p>
                </Upload.Dragger>
              </Form.Item>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setBidModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Submit Bid
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      </div>
    </VendorLayout>
  )
}