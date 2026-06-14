"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  Search,
  FileText,
  Video,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

export default function HelpAndSupportPage() {
  return (
    <main className="grid gap-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Get help with CogniLab, find answers to common questions, and connect
          with our support team.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Search Help</h3>
                <p className="text-sm text-muted-foreground">
                  Find answers quickly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Mail className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed help
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Phone className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">Phone Support</h3>
                <p className="text-sm text-muted-foreground">
                  Call us directly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Help Topics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Creating Your First Experiment</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Adding Team Members</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span>Understanding Analytics</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Account Setup & Preferences</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 rounded-lg border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                        Experiment Not Running
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Check your experiment configuration and ensure all
                        required fields are filled.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        Data Not Appearing
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Verify participant links are working and check your
                        analytics dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">
                        Login Issues
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Try clearing your browser cache or resetting your
                        password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Tutorials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Platform Overview
                      </p>
                    </div>
                  </div>
                  <h4 className="font-semibold">Platform Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn the basics of CogniLab
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Creating Experiments
                      </p>
                    </div>
                  </div>
                  <h4 className="font-semibold">Creating Experiments</h4>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step experiment setup
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Support & Resources */}
        <div className="space-y-6">
          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">
                      Available 24/7
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <Mail className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">
                      support@cognilab.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <Phone className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                User Guide
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                API Documentation
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Developer Guide
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Platform Status</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Quick Downloads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Quick Downloads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                User Manual PDF
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Sample Experiment Templates
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                API Reference
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                How do I create my first experiment?
              </h4>
              <p className="text-sm text-muted-foreground">
                Navigate to the Experiments section, click "Create New
                Experiment", and follow the step-by-step wizard. You can choose
                from our pre-built templates or create a custom experiment.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                How many participants can I have in an experiment?
              </h4>
              <p className="text-sm text-muted-foreground">
                The number of participants depends on your plan. Free accounts
                can have up to 100 participants per experiment, while Pro
                accounts support up to 1,000 participants.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                Can I export my experiment data?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can export your data in multiple formats including CSV,
                JSON, and Excel. Go to the Analytics section and use the export
                options.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                How do I invite team members to my project?
              </h4>
              <p className="text-sm text-muted-foreground">
                Go to the Members section, click "Invite Member", and enter
                their email address. They'll receive an invitation to join your
                project.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
