'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import Link from 'next/link'
import { Form, Input, Button, Card, Typography, Alert, Divider, Space } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useLoginMutation } from '@/store/api/procurementApi'
import { selectIsAuthenticated } from '@/store/slices/authSlice'

const { Title, Text } = Typography

interface LoginFormData {
  email: string
  password: string
}

export default function VendorLogin() {
  const [form] = Form.useForm()
  const router = useRouter()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [login, { isLoading }] = useLoginMutation()
  const [loginError, setLoginError] = useState<string>('')

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/vendor/dashboard')
    }
  }, [isAuthenticated, router])

  const onFinish = async (values: LoginFormData) => {
    try {
      setLoginError('')
      const result = await login(values).unwrap()
      
      // Dispatch the login action with the received data
      dispatch({
        type: 'auth/setCredentials',
        payload: {
          token: result.accessToken,
          user: result.user
        }
      })
      
      // Navigate to dashboard
      router.push('/vendor/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error?.data?.message) {
        setLoginError(error.data.message)
      } else if (error?.message) {
        setLoginError(error.message)
      } else {
        setLoginError('Invalid email or password. Please try again.')
      }
    }
  }

  const handleTestLogin = () => {
    form.setFieldsValue({
      email: 'vendor@eproc.local',
      password: 'vendor123'
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card 
          className="shadow-xl border-0"
          styles={{
            body: { padding: '2rem' }
          }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <UserOutlined className="text-2xl text-white" />
            </div>
            <Title level={2} className="!mb-2 !text-gray-800">
              Vendor Portal
            </Title>
            <Text type="secondary" className="text-base">
              Sign in to your account
            </Text>
          </div>

          {loginError && (
            <Alert
              message="Login Failed"
              description={loginError}
              type="error"
              showIcon
              className="mb-6"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                className="h-12 text-base font-medium"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text type="secondary" className="text-sm">
              Development
            </Text>
          </Divider>

          <Space direction="vertical" className="w-full">
            <Button
              type="dashed"
              block
              onClick={handleTestLogin}
              className="text-sm"
            >
              Use Test Credentials
            </Button>
            
            <div className="text-center mt-4">
              <Text type="secondary" className="text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/vendor/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Register here
                </Link>
              </Text>
            </div>
          </Space>
        </Card>

        <div className="text-center mt-6">
          <Text type="secondary" className="text-xs">
            © 2024 E-Procurement Vendor Portal. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  )
}
