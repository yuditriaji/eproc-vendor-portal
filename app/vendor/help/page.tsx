'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Search, 
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import type { FAQ, SupportTicket, SupportTicketStatus, SupportTicketPriority, SupportTicketCategory } from '@/types';

const statusConfig: Record<SupportTicketStatus, { label: string; variant: any; icon: any }> = {
  OPEN: { label: 'Open', variant: 'default', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', variant: 'outline', icon: Clock },
  RESOLVED: { label: 'Resolved', variant: 'secondary', icon: CheckCircle },
  CLOSED: { label: 'Closed', variant: 'outline', icon: CheckCircle },
};

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Mock FAQs
  const faqs: FAQ[] = [
    {
      id: '1',
      category: 'Getting Started',
      question: 'How do I create my first bid?',
      answer: 'To create your first bid, navigate to the Tenders page, find a tender you\'re interested in, click on it to view details, and then click the "Submit Bid" button. Fill in the required information including your pricing, technical proposal, and any required documents.',
      order: 1,
    },
    {
      id: '2',
      category: 'Getting Started',
      question: 'What documents do I need to upload for compliance?',
      answer: 'You need to upload essential business documents including: Business Registration Certificate, Tax Compliance Certificate, Insurance Certificate, and any relevant ISO certifications. Navigate to the Compliance page to upload these documents.',
      order: 2,
    },
    {
      id: '3',
      category: 'Bids & Tenders',
      question: 'How can I track the status of my bids?',
      answer: 'Go to the "My Bids" page where you can see all your submitted bids along with their current status (Draft, Submitted, Under Review, Accepted, or Rejected). You\'ll also receive email notifications when your bid status changes.',
      order: 3,
    },
    {
      id: '4',
      category: 'Bids & Tenders',
      question: 'Can I modify a bid after submission?',
      answer: 'No, once a bid is submitted, it cannot be modified. However, if the tender is still open and you notice an error, you can contact support to request bid withdrawal, and then submit a new bid.',
      order: 4,
    },
    {
      id: '5',
      category: 'Payments',
      question: 'When will I receive payment for completed contracts?',
      answer: 'Payment schedules are defined in your contract. Typically, payments are processed within 30 days after invoice approval. You can track payment status on the Payments page.',
      order: 5,
    },
    {
      id: '6',
      category: 'Payments',
      question: 'How do I submit an invoice?',
      answer: 'Navigate to the Invoices page and click "Create Invoice". Select the contract, add line items, and upload any supporting documents. Once submitted, it will go through the approval workflow.',
      order: 6,
    },
    {
      id: '7',
      category: 'Account & Profile',
      question: 'How do I update my company information?',
      answer: 'Go to Profile > Company tab where you can update your company name, address, contact information, tax ID, and business description. Remember to save changes after updating.',
      order: 7,
    },
    {
      id: '8',
      category: 'Account & Profile',
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Settings > Security tab and toggle on "Enable 2FA". Follow the instructions to set up an authenticator app. This adds an extra layer of security to your account.',
      order: 8,
    },
  ];

  // Mock support tickets
  const supportTickets: SupportTicket[] = [
    {
      id: '1',
      subject: 'Unable to upload documents for compliance',
      description: 'Getting an error when trying to upload my ISO certification document.',
      category: 'TECHNICAL',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: '2025-11-20',
      updatedAt: '2025-11-21',
      assignedTo: 'support-001',
      assignedToName: 'John Support',
    },
    {
      id: '2',
      subject: 'Question about payment schedule',
      description: 'When will my invoice INV-2025-001 be paid?',
      category: 'BILLING',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      createdAt: '2025-11-18',
      updatedAt: '2025-11-19',
      resolvedAt: '2025-11-19',
      assignedTo: 'support-002',
      assignedToName: 'Sarah Finance',
    },
  ];

  const filteredFAQs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const faqsByCategory = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-1">
          Find answers and get support for your e-procurement needs
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@eproc.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Support Hours</p>
                <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="docs">
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <MessageSquare className="h-4 w-4 mr-2" />
            Support Tickets
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {Object.entries(faqsByCategory).map(([category, categoryFAQs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryFAQs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg">
                    <button
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-accent transition-colors"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <span className="font-medium">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="p-4 pt-0 text-sm text-muted-foreground border-t">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {filteredFAQs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or contact support
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Getting Started Guide
                </CardTitle>
                <CardDescription>
                  Learn the basics of using the vendor portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Read Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Bid Submission Process
                </CardTitle>
                <CardDescription>
                  Step-by-step guide to submitting bids
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Read Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Compliance Requirements
                </CardTitle>
                <CardDescription>
                  Understanding compliance documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Read Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Payment & Invoicing
                </CardTitle>
                <CardDescription>
                  How to manage invoices and payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Read Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Contract Management
                </CardTitle>
                <CardDescription>
                  Managing your awarded contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Read Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Best Practices
                </CardTitle>
                <CardDescription>
                  Tips for successful vendor participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Read Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create New Ticket</CardTitle>
                  <CardDescription>Submit a support request</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue="GENERAL">
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TECHNICAL">Technical Issue</SelectItem>
                      <SelectItem value="BILLING">Billing Question</SelectItem>
                      <SelectItem value="GENERAL">General Inquiry</SelectItem>
                      <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                      <SelectItem value="BUG_REPORT">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select defaultValue="MEDIUM">
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your issue..."
                  rows={6}
                />
              </div>

              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Submit Ticket
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
              <CardDescription>View and track your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => {
                  const StatusIcon = statusConfig[ticket.status].icon;
                  return (
                    <div
                      key={ticket.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <Badge variant={statusConfig[ticket.status].variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[ticket.status].label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {ticket.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {formatDate(ticket.createdAt)}</span>
                          {ticket.assignedToName && (
                            <span>Assigned to: {ticket.assignedToName}</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  );
                })}

                {supportTickets.length === 0 && (
                  <div className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No support tickets yet</h3>
                    <p className="text-muted-foreground">
                      Create a ticket above if you need assistance
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
