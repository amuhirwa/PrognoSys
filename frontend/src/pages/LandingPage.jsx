import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, Brain, ChartBar, Users, Heart, ArrowRight, CheckCircle2, Clock, Lock, LineChart, Stethoscope, Hospital, MessageSquare, Award, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LandingPage = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms for accurate disease prediction and risk assessment"
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Continuous patient health tracking and instant alerts for critical changes"
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive patient profiles and medical history tracking"
    },
    {
      icon: ChartBar,
      title: "Analytics Dashboard",
      description: "Detailed insights and visualization of patient data and treatment outcomes"
    }
  ];

  const benefits = [
    "Early disease detection and prevention",
    "Reduced healthcare costs",
    "Improved patient outcomes",
    "Streamlined workflow efficiency",
    "Data-driven decision making",
    "Enhanced patient engagement",
    "HIPAA compliant security",
    "24/7 technical support"
  ];

  const testimonials = [
    {
      quote: "PrognoSys has revolutionized how we handle patient care. The predictive analytics have helped us prevent numerous critical situations.",
      author: "Dr. Sarah Chen",
      role: "Chief of Medicine, Metro Hospital"
    },
    {
      quote: "The accuracy of the AI predictions is remarkable. It's like having an expert consultant available 24/7.",
      author: "Dr. Michael Roberts",
      role: "Cardiologist, Heart Care Center"
    },
    {
      quote: "Implementation was smooth, and the results were immediate. Our patient satisfaction scores have increased significantly.",
      author: "Dr. Emily Thompson",
      role: "Medical Director, City Clinic"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/50 to-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 pt-24 pb-20 text-center">
        <div className="animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-blue-400/20 rounded-full" />
              <Shield className="h-20 w-20 text-blue-600 relative" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Progno<span className="text-blue-600">Sys</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Empowering healthcare professionals with AI-driven predictions and comprehensive patient management
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="px-8 py-6 text-lg rounded-xl hover:scale-105 transition-transform">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            Powerful Features for Modern Healthcare
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our comprehensive suite of tools helps healthcare providers deliver better patient outcomes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl mb-6 ring-1 ring-blue-100">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 skew-y-3" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { value: "98.5%", label: "Prediction Accuracy" },
              { value: "10,000+", label: "Patients Managed" },
              { value: "500+", label: "Healthcare Providers" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-3">{stat.value}</div>
                <p className="text-gray-600 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            Why Choose PrognoSys?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the future of healthcare management with our comprehensive solution
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="ml-3 text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              How PrognoSys Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A simple yet powerful workflow designed for healthcare professionals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: LineChart,
                title: "Data Analysis",
                description: "Our AI analyzes patient data to identify patterns and predict potential health risks"
              },
              {
                icon: Stethoscope,
                title: "Clinical Insights",
                description: "Receive actionable insights and treatment recommendations based on comprehensive analysis"
              },
              {
                icon: Hospital,
                title: "Patient Care",
                description: "Implement personalized care plans and monitor patient progress in real-time"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[40%] h-[2px] bg-blue-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Trusted by Leading Healthcare Providers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what medical professionals are saying about PrognoSys
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                <MessageSquare className="h-8 w-8 text-blue-600 mb-6" />
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">
                Enterprise-Grade Security
              </h2>
              <p className="text-gray-600 mb-8">
                Your data security is our top priority. We implement the highest standards
                of security measures to protect sensitive medical information.
              </p>
              <div className="space-y-4">
                {[
                  "HIPAA Compliant Infrastructure",
                  "End-to-End Encryption",
                  "Regular Security Audits",
                  "Advanced Access Controls"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Lock className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:pl-12">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Award, label: "SOC 2 Certified" },
                    { icon: Lock, label: "HIPAA Compliant" },
                    { icon: Shield, label: "256-bit Encryption" },
                    { icon: Clock, label: "24/7 Monitoring" }
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                        <item.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Partners Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Seamless Integration
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Works with your existing healthcare systems and EHR platforms
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Replace these with actual partner logos */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-400">Partner Logo</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-blue-600 rounded-2xl p-12 text-white">
          <Heart className="h-12 w-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals using PrognoSys to improve patient outcomes
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-gray-600 border-t">
        <p>© 2024 PrognoSys. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage; 