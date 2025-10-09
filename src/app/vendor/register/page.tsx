'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import Link from 'next/link'
import { Form, Input, Button, Card, Typography, Alert, Row, Col, Divider, Progress, Space, Steps } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { useRegisterMutation } from '@/store/api/procurementApi'
import { setCredentials } from '@/store/slices/authSlice'

const { Title, Text } = Typography

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  company: string
  phone: string
}

export default function VendorRegisterPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const dispatch = useDispatch()
  const [register, { isLoading }] = useRegisterMutation()
  const [registerError, setRegisterError] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(0)
  const [password, setPassword] = useState('')

  // Password strength checker
  const getPasswordStrength = (password: string): number => {
    let score = 0
    if (password.length >= 8) score += 20
    if (/[a-z]/.test(password)) score += 20
    if (/[A-Z]/.test(password)) score += 20
    if (/\d/.test(password)) score += 20
    if (/[@$!%*?&]/.test(password)) score += 20
    return score
  }

  const passwordStrength = password ? getPasswordStrength(password) : 0
  const getStrengthColor = (strength: number) => {
    if (strength < 40) return '#ff4d4f'
    if (strength < 60) return '#fa8c16'
    if (strength < 80) return '#1890ff'
    return '#52c41a'
  }

  const getStrengthText = (strength: number) => {
    if (strength < 40) return 'Weak'
    if (strength < 60) return 'Fair'
    if (strength < 80) return 'Good'
    return 'Strong'
  }

  const onFinish = async (values: RegisterFormData) => {
    try {
      setRegisterError('')
      setCurrentStep(1)
      
      const registerData = {
        email: values.email,
        username: values.email, // Use email as username
        password: values.password,
        firstName: values.name.split(' ')[0] || values.name,
        lastName: values.name.split(' ').slice(1).join(' ') || '',
        role: 'vendor'
      }
      
      const result = await register(registerData).unwrap() as any
      
      // Store credentials in Redux
      dispatch(setCredentials({
        token: result.accessToken,
        user: {
          id: result.user.userId || result.user.id,
          email: result.user.email,
          username: result.user.username,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          verified: result.user.verified,
          createdAt: result.user.createdAt,
          // Legacy fields for compatibility
          name: values.name,
          company: values.company,
          phone: values.phone,
        },
      }));

      // Show success step
      setCurrentStep(2)

      // Redirect after success
      setTimeout(() => {
        router.push('/vendor/dashboard')
      }, 2000)
    } catch (error: any) {
      console.error('Registration error:', error)
      setCurrentStep(0)
      
      if (error?.data?.message) {
        setRegisterError(error.data.message)
      } else if (error?.message) {
        setRegisterError(error.message)
      } else {
        setRegisterError('Registration failed. Please try again.')
      }
    }
  }

  const steps = [
    {
      title: 'Account Information',
      description: 'Enter your details',
      icon: <UserOutlined />
    },
    {
      title: 'Processing',
      description: 'Creating account',
      icon: <LockOutlined />
    },
    {
      title: 'Complete',
      description: 'Account created',
      icon: <CheckCircleOutlined />
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <Row gutter={32}>
          {/* Left Column - Info */}
          <Col xs={24} lg={8}>
            <Card className="shadow-lg border-0 h-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <HomeOutlined className="text-2xl text-white" />
                </div>
                <Title level={3} className="!mb-2">
                  Join Our Network
                </Title>
                <Text type="secondary">
                  Connect with buyers across global procurement opportunities
                </Text>
              </div>

              <Space direction="vertical" size="middle" className="w-full">
                <div className="flex items-start space-x-3">
                  <CheckCircleOutlined className="text-green-500 text-lg mt-0.5" />
                  <div>
                    <Text strong>Global Reach</Text>
                    <div>
                      <Text type="secondary" className="text-sm">
                        Access procurement opportunities worldwide
                      </Text>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircleOutlined className="text-green-500 text-lg mt-0.5" />
                  <div>
                    <Text strong>Secure Platform</Text>
                    <div>
                      <Text type="secondary" className="text-sm">
                        Bank-level security for all transactions
                      </Text>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircleOutlined className="text-green-500 text-lg mt-0.5" />
                  <div>
                    <Text strong>Easy Management</Text>
                    <div>
                      <Text type="secondary" className="text-sm">
                        Streamlined bid and contract management
                      </Text>
                    </div>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Right Column - Registration Form */}
          <Col xs={24} lg={16}>
            <Card className="shadow-xl border-0" styles={{ body: { padding: '2rem' } }}>
              <div className="mb-6">
                <Title level={2} className="!mb-2 text-center">
                  Create Vendor Account
                </Title>
                <Text type="secondary" className="text-center block mb-6">
                  Enter your information to get started
                </Text>
                
                <Steps
                  current={currentStep}
                  items={steps}
                  className="mb-8"
                  size="small"
                />
              </div>

              {registerError && (
                <Alert
                  message="Registration Failed"
                  description={registerError}
                  type="error"
                  showIcon
                  className="mb-6"
                />
              )}

              {currentStep === 0 && (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  autoComplete="off"
                  size="large"
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[
                          { required: true, message: 'Please enter your name!' },
                          { min: 2, message: 'Name must be at least 2 characters!' }
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined className="text-gray-400" />}
                          placeholder="Enter your full name"
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="company"
                        label="Company Name"
                        rules={[
                          { required: true, message: 'Please enter company name!' },
                          { min: 2, message: 'Company name must be at least 2 characters!' }
                        ]}
                      >
                        <Input
                          prefix={<HomeOutlined className="text-gray-400" />}
                          placeholder="Enter your company name"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: 'Please enter your email!' },
                          { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined className="text-gray-400" />}
                          placeholder="john@company.com"
                          autoComplete="email"
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[
                          { required: true, message: 'Please enter your phone!' },
                          { pattern: /^[+]?[0-9\s\-\(\)]{10,}$/, message: 'Please enter a valid phone number!' }
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined className="text-gray-400" />}
                          placeholder="+1 (555) 123-4567"
                          autoComplete="tel"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                          { required: true, message: 'Please enter password!' },
                          { min: 8, message: 'Password must be at least 8 characters!' }
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="Create a strong password"
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                        />
                      </Form.Item>
                      
                      {password && (
                        <div className="mb-4">
                          <Text className="text-sm text-gray-600 block mb-2">
                            Password Strength: {getStrengthText(passwordStrength)}
                          </Text>
                          <Progress
                            percent={passwordStrength}
                            strokeColor={getStrengthColor(passwordStrength)}
                            showInfo={false}
                            size="small"
                          />
                        </div>
                      )}
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        dependencies={['password']}
                        rules={[
                          { required: true, message: 'Please confirm password!' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve()
                              }
                              return Promise.reject(new Error('Passwords do not match!'))
                            },
                          })
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="Confirm your password"
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                          autoComplete="new-password"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item className="mb-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      block
                      className="h-12 text-base font-medium"
                    >
                      Create Vendor Account
                    </Button>
                  </Form.Item>
                </Form>
              )}

              {currentStep === 1 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <Title level={3}>Creating Your Account...</Title>
                  <Text type="secondary">Please wait while we set up your vendor profile</Text>
                </div>
              )}

              {currentStep === 2 && (
                <div className="text-center py-8">
                  <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
                  <Title level={3} className="text-green-600 !mb-2">
                    Account Created Successfully!
                  </Title>
                  <Text type="secondary" className="block mb-4">
                    Welcome to the E-Procurement Vendor Portal
                  </Text>
                  <Text type="secondary">
                    Redirecting to your dashboard...
                  </Text>
                </div>
              )}

              {currentStep === 0 && (
                <>
                  <Divider>
                    <Text type="secondary" className="text-sm">Or</Text>
                  </Divider>
                  
                  <div className="text-center">
                    <Text type="secondary" className="text-sm">
                      Already have an account?{' '}
                      <Link href="/vendor/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Sign in here
                      </Link>
                    </Text>
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>

        <div className="text-center mt-6">
          <Text type="secondary" className="text-xs">
            © 2024 E-Procurement Vendor Portal. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  )
}
