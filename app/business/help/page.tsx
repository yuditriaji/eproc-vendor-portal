'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, MessageSquare, Phone } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-1">
          Get help and find answers to common questions
        </p>
      </div>

      {/* Quick Help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <Book className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse our comprehensive guides and tutorials
            </p>
            <Button variant="outline" className="w-full">View Docs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get in touch with our support team
            </p>
            <Button variant="outline" className="w-full">Send Message</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Phone className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Call Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Speak directly with a support agent
            </p>
            <Button variant="outline" className="w-full">+1 (555) 123-4567</Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                question: 'How do I create a new tender?',
                answer: 'Navigate to Tenders page and click "Create Tender" button',
              },
              {
                question: 'How do I approve purchase requisitions?',
                answer: 'Go to Approvals page to see all pending items',
              },
              {
                question: 'How do I process payments?',
                answer: 'Visit the Payments section in Finance menu',
              },
              {
                question: 'How do I generate reports?',
                answer: 'Access Reports section for procurement and financial analytics',
              },
            ].map((faq, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="font-semibold mb-2">{faq.question}</div>
                <div className="text-sm text-muted-foreground">{faq.answer}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span className="font-medium">All systems operational</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
