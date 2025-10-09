'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Button,
  Typography,
  Space,
  Divider,
  notification,
  Drawer,
  Card,
  Statistic,
  Progress,
  Alert,
  Tooltip
} from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SearchOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  SecurityScanOutlined
} from '@ant-design/icons'
import { selectIsAuthenticated, selectUser, logout } from '@/store/slices/authSlice'
import { useLogoutMutation } from '@/store/api/procurementApi'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

interface VendorLayoutProps {
  children: React.ReactNode
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const [logoutMutation] = useLogoutMutation()
  
  // State management
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/vendor/login')
    }
  }, [isAuthenticated, router])

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
      notification.success({
        message: 'Logged Out',
        description: 'You have been successfully logged out.',
        placement: 'topRight'
      })
      router.push('/vendor/login')
    } catch (error) {
      dispatch(logout())
      router.push('/vendor/login')
    }
  }

  // User menu items
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => router.push('/vendor/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
      onClick: () => router.push('/vendor/settings')
    },
    {
      key: 'security',
      icon: <SecurityScanOutlined />,
      label: 'Security',
      onClick: () => router.push('/vendor/security')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ]

  // Navigation menu items
  const menuItems = [
    {
      key: '/vendor/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/vendor/tenders',
      icon: <FileTextOutlined />,
      label: 'Browse Tenders'
    },
    {
      key: '/vendor/bids',
      icon: <ShoppingOutlined />,
      label: 'My Bids'
    },
    {
      key: '/vendor/contracts',
      icon: <TrophyOutlined />,
      label: 'My Contracts'
    },
    {
      key: '/vendor/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'account-section',
      type: 'group' as const,
      label: 'Account',
      children: [
        {
          key: '/vendor/profile',
          icon: <UserOutlined />,
          label: 'My Profile'
        },
        {
          key: '/vendor/settings',
          icon: <SettingOutlined />,
          label: 'Settings'
        }
      ]
    }
  ]

  // Get current page info
  const getCurrentPageTitle = () => {
    switch (pathname) {
      case '/vendor/dashboard':
        return 'Dashboard'
      case '/vendor/tenders':
        return 'Browse Tenders'
      case '/vendor/bids':
        return 'My Bids'
      case '/vendor/contracts':
        return 'My Contracts'
      case '/vendor/analytics':
        return 'Analytics'
      case '/vendor/profile':
        return 'My Profile'
      case '/vendor/settings':
        return 'Settings'
      default:
        return 'Vendor Portal'
    }
  }

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Bid Accepted',
      message: 'Your bid for Office Supplies tender has been accepted!',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'warning',
      title: 'Tender Closing Soon',
      message: 'IT Equipment tender closes in 2 days',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'info',
      title: 'New Tender Available',
      message: 'Marketing Services tender has been published',
      time: '3 hours ago',
      unread: false
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  // Mobile breakpoint
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileDrawerVisible(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isAuthenticated) {
    return null
  }

  const siderContent = (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[pathname]}
      style={{ borderRight: 0 }}
      items={menuItems}
      onClick={({ key }) => {
        if (key && typeof key === 'string' && key.startsWith('/')) {
          router.push(key)
          if (isMobile) {
            setMobileDrawerVisible(false)
          }
        }
      }}
    />
  )

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={250}
          className="shadow-md"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-center mb-6">
              {!collapsed ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <FileTextOutlined className="text-white text-xl" />
                  </div>
                  <Title level={4} className="!mb-0 !text-gray-800">
                    E-Procurement
                  </Title>
                  <Text type="secondary" className="text-xs">
                    Vendor Portal
                  </Text>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileTextOutlined className="text-white" />
                </div>
              )}
            </div>
            
            {!collapsed && (
              <Card size="small" className="mb-4">
                <div className="text-center">
                  <Avatar 
                    size="large" 
                    icon={<UserOutlined />} 
                    className="mb-2 bg-blue-500"
                  >
                    {(user?.name || 'V').charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <Text strong className="block">{user?.name || 'Vendor User'}</Text>
                    <Text type="secondary" className="text-xs">{user?.email}</Text>
                  </div>
                </div>
              </Card>
            )}
          </div>
          
          {siderContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        bodyStyle={{ padding: 0 }}
        width={250}
      >
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <FileTextOutlined className="text-white text-xl" />
            </div>
            <Title level={4} className="!mb-0 !text-gray-800">
              E-Procurement
            </Title>
            <Text type="secondary" className="text-xs">
              Vendor Portal
            </Text>
          </div>
          
          <Card size="small" className="mb-4">
            <div className="text-center">
              <Avatar 
                size="large" 
                icon={<UserOutlined />} 
                className="mb-2 bg-blue-500"
              >
                {(user?.name || 'V').charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Text strong className="block">{user?.name || 'Vendor User'}</Text>
                <Text type="secondary" className="text-xs">{user?.email}</Text>
              </div>
            </div>
          </Card>
        </div>
        
        {siderContent}
      </Drawer>

      {/* Main Layout */}
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 250),
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between" style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%'
        }}>
          <div className="flex items-center">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setMobileDrawerVisible(true)}
                className="mr-4"
              />
            )}
            
            {!isMobile && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="mr-4"
              />
            )}
            
            <div>
              <Title level={4} className="!mb-0">
                {getCurrentPageTitle()}
              </Title>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <Tooltip title="Global Search">
              <Button 
                type="text" 
                icon={<SearchOutlined />} 
                size="large"
                onClick={() => router.push('/vendor/tenders')}
              />
            </Tooltip>

            {/* Help */}
            <Tooltip title="Help & Support">
              <Button 
                type="text" 
                icon={<QuestionCircleOutlined />} 
                size="large"
              />
            </Tooltip>

            {/* Notifications */}
            <Badge count={unreadCount} offset={[-2, 2]}>
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                size="large"
                onClick={() => setNotificationDrawerVisible(true)}
              />
            </Badge>

            {/* User Avatar */}
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <Avatar 
                size="large" 
                icon={<UserOutlined />} 
                className="cursor-pointer bg-blue-500"
              >
                {(user?.name || 'V').charAt(0).toUpperCase()}
              </Avatar>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content 
          className="overflow-auto bg-gray-50" 
          style={{ 
            padding: 0,
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          {children}
        </Content>

        {/* Notifications Drawer */}
        <Drawer
          title="Notifications"
          placement="right"
          onClose={() => setNotificationDrawerVisible(false)}
          open={notificationDrawerVisible}
          width={400}
        >
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                size="small"
                className={notification.unread ? 'border-blue-200 bg-blue-50' : ''}
              >
                <div className="flex justify-between items-start mb-2">
                  <Text strong className={notification.unread ? 'text-blue-800' : ''}>
                    {notification.title}
                  </Text>
                  {notification.unread && (
                    <Badge status="processing" />
                  )}
                </div>
                <Text className="text-sm block mb-2">
                  {notification.message}
                </Text>
                <Text type="secondary" className="text-xs">
                  {notification.time}
                </Text>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button type="link">View All Notifications</Button>
          </div>
        </Drawer>
      </Layout>
    </Layout>
  )
}