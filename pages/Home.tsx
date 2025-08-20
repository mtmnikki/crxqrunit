/**
 * ClinicalRxQ Homepage - Main marketing landing page
 * Includes hero, advantage, programs, metrics, testimonials, and CTA sections.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Target,
  Zap,
  Shield,
  Award,
  BookOpen,
  FileText,
  Heart,
  Quote,
  Stethoscope,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import SafeText from '@/components/common/SafeText';

/**
 * Interface representing a program card item in the Programs section
 */
interface ProgramCardItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

/**
 * Small reusable card to display program information in the Programs section
 */
function ProgramCard({ item }: { item: ProgramCardItem }) {
  return (
    <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <item.icon className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-white text-lg">
            <SafeText value={item.title} />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-sm mb-4">
          <SafeText value={item.description} />
        </p>
        <ul className="space-y-2">
          {item.features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-400">
              <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
              <SafeText value={feature} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * Homepage component
 */
export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const differentiators = [
    {
      icon: Stethoscope,
      title: "Designed by Community Pharmacists",
      description: "Every protocol was created and tested in real community pharmacy settings by practicing pharmacists who understand your daily challenges."
    },
    {
      icon: BookOpen,
      title: "Implementation, Not Just Education",
      description: "We teach the 'how,' not just the 'what.' Complete operational toolkits ensure you can launch services immediately and correctly."
    },
    {
      icon: TrendingUp,
      title: "Proven Financial Models",
      description: "Each service includes detailed billing protocols and proven revenue models. TimeMyMeds alone generates $75,000 per 100 patients enrolled."
    },
    {
      icon: Heart,
      title: "Patient-Centered Approach",
      description: "Transform from product-centric dispensing to patient-centered care that improves outcomes and builds lasting relationships."
    }
  ];

  const features = [
    {
      title: 'Operational Flywheel',
      description:
        'Transform from reactive dispensing to proactive, appointment-based care with TimeMyMeds synchronization',
      icon: Target,
      color: 'from-green-300 to-teal-400',
    },
    {
      title: 'Technician Force Multiplier',
      description:
        'Empower your pharmacy technicians to handle operational tasks, freeing pharmacists for clinical excellence',
      icon: Users,
      color: 'from-teal-500 to-cyan-300',
    },
    {
      title: 'Turnkey Clinical Infrastructure',
      description:
        'Complete business-in-a-box solution with protocols, forms, billing codes, and implementation guides',
      icon: Shield,
      color: 'from-cyan-400 to-blue-700',
    },
  ];

  /**
   * Programs displayed in the homepage programs section
   */
  const programs: ProgramCardItem[] = [
    {
      title: 'TimeMyMeds',
      description: 'Create predictable appointment schedules that enable clinical service delivery',
      icon: Clock,
      features: ['Comprehensive Reviews', 'Billing Expertise', 'Patient Outcomes'],
    },
    {
      title: 'MTM The Future Today',
      description:
        'Team-based Medication Therapy Management with proven protocols and technician workflows',
      icon: FileText,
      features: ['Comprehensive Reviews', 'Billing Expertise', 'Patient Outcomes'],
    },
    {
      title: 'Test & Treat Services',
      description: 'Point-of-care testing and treatment for Flu, Strep, and COVID-19',
      icon: Zap,
      features: ['CLIA-Waived Testing', 'State Protocols', 'Medical Billing'],
    },
    {
      title: 'HbA1c Testing',
      description: 'Diabetes management with point-of-care A1c testing and clinical integration',
      icon: Award,
      features: ['Quality Metrics', 'Provider Communication', 'Value-Based Care'],
    },
    {
      title: 'Pharmacist-Initiated Oral Contraceptives',
      description:
        'From patient intake and care decisions, to billing and record-keeping, simplified service steps for your team and patients',
      icon: Heart,
      features: [
        'Practice-Based Clinical Skills',
        'Pharmacy Tech Training',
        'Prescribing with Confidence',
      ],
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-500 opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/cd53336d-d6e2-4c6b-bf62-bba9d1f359ba.png')] bg-center bg-cover opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <Badge className="bg-gradient-to-r from-blue-600 to-teal-400 text-white border-0">
                  Where Dispensing Meets Direct Patient Care
                </Badge>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Transform Your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                  Pharmacy Practice
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The complete ecosystem for community pharmacy teams to deliver profitable, patient-centered
                clinical services with proven protocols and turnkey infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="bg-brand-gradient hover:opacity-90 text-white shadow-lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-blue-600 text-blue-700 hover:bg-blue-200"
                  >
                    Explore Programs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  No long-term contracts
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  30-day money-back guarantee
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <img
                  src="https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/586a328a-c576-4a4b-ab52-e4c62129d105.png"
                  alt="Pharmacist providing clinical care"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-2xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* The ClinicalRxQ Advantage */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0 mb-4">
              THE CLINICALRXQ ADVANTAGE
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              A better way to build your{' '}
              <span className="bg-gradient-to-r from-cyan-500 to-teal-600 bg-clip-text text-transparent">clinical practice</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our integrated ecosystem addresses the primary barriers—time, workflow, and profitability—that
              have historically hindered widespread adoption of advanced clinical services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
                  activeFeature === index ? 'ring-2 ring-cyan-500' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`}></div>
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">
                    <SafeText value={feature.title} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    <SafeText value={feature.description} />
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading and description */}
          <div className="mb-14 text-left">
            <p className="text-2xl sm:text-3xl font-semibold text-white/90">Comprehensive, Team-Based</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold mt-1">
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Training & Resources
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl">
              Practice-based training modules, step-by-step implementation protocols, and specialized
              documentation forms and resources built for community pharmacy teams, by community pharmacy teams.
            </p>
            <p className="text-sm sm:text-base text-gray-400 mt-4">
              Tested. Refined. Shared. Transform the profession by transforming our practice.
            </p>

            <div className="mt-6">
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-cyan-500 text-cyan-400 hover:bg-white hover:text-gray-900"
                >
                  View All Programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Program cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {/* Row 1: first three cards */}
            <ProgramCard item={programs[0]} />
            <ProgramCard item={programs[1]} />
            <ProgramCard item={programs[2]} />

            {/* Row 2: pharmacist image at bottom-left */}
            <div className="hidden md:block relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700 shadow-xl">
              <img
                src="https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/f91471b8-97b6-486e-b92b-c30c929298d4.png"
                alt="Pharmacist gesturing to programs"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
            </div>

            {/* Row 2: two more cards to the right */}
            <ProgramCard item={programs[3]} />
            <ProgramCard item={programs[4]} />
          </div>
        </div>
      </section>

      {/* Gradient Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300"></div>
        <div className="absolute inset-0 bg-[url('https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/cd53336d-d6e2-4c6b-bf62-bba9d1f359ba.png')] bg-center bg-cover opacity-20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="mb-6">
            <Badge className="bg-white/20 text-white border-white/30">
              Where Dispensing Meets Direct Patient Care
            </Badge>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            About ClinicalRxQ
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            We're transforming community pharmacy from product-centric dispensaries into 
            patient-centered, decentralized healthcare hubs through comprehensive training 
            and turnkey clinical infrastructure.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 bg-clip-text text-transparent">
                Philosophy
              </span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white shadow-xl">
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-cyan-400 mb-4 mx-auto" />
                  <p className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
                    "Retail is a FOUR-LETTER Word. We are COMMUNITY PHARMACISTS."
                  </p>
                  <p className="text-lg text-gray-700 mb-4">
                    Retailers sell product. Community Pharmacists deliver medical treatments. 
                    We provide counseling and clinical services to accompany the medical 
                    treatments we deliver to our patients.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Our program emphasizes the important role the Community Pharmacist plays 
                    on the healthcare team and trains Community Pharmacists on how to utilize 
                    their clinical training inside the community pharmacy workflow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 mb-4">
                OUR MISSION
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Tangibly Impact{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 bg-clip-text text-transparent">
                  Pharmacy Practice
                </span>
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Our mission is to deliver patient-centered, team-based training and protocols 
                for the provision of enhanced clinical services. We design educational activities 
                to increase the efficiency and efficacy of these services, with a specific focus 
                on integrating pharmacy technicians into the clinical workflow.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Standardize Clinical Services</p>
                    <p className="text-gray-600 text-sm">
                      Consistent preventive and chronic disease management across all settings
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Elevate the Pharmacist Role</p>
                    <p className="text-gray-600 text-sm">
                      Position pharmacists as indispensable healthcare providers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Maximize Financial Viability</p>
                    <p className="text-gray-600 text-sm">
                      Align services with payer expectations for sustainable revenue
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/7dbdc3ac-3984-4d36-b13b-f3874cbf15fc.jpg" 
                alt="Pharmacy team collaboration"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 rounded-2xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              The ClinicalRxQ{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 bg-clip-text text-transparent">
                Difference
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just teach clinical knowledge—we provide the complete infrastructure 
              for successful implementation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {differentiators.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">
                      <SafeText value={item.title} />
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    <SafeText value={item.description} />
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Who We{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 bg-clip-text text-transparent">
                Serve
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Lightbulb className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Licensed Pharmacists</h3>
                <p className="text-gray-600 text-sm">
                  Community Pharmacists tired of PBMs, ready to expand their clinical services 
                  and practice at the top of their license
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Pharmacy Technicians</h3>
                <p className="text-gray-600 text-sm">
                  Essential team members who multiply pharmacist effectiveness through 
                  operational excellence
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community Pharmacy Focus</h3>
                <p className="text-gray-600 text-sm">
                  From independent single-store pharmacies to large multi-site enterprises 
                  seeking transformation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-800 via-cyan-500 to-teal-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Practice?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of pharmacy professionals who have revolutionized their practice with ClinicalRxQ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                <Play className="mr-2 h-5 w-5" />
                Start Your Transformation
              </Button>
            </Link>
            <Link to="/about">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}