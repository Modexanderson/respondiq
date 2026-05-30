import { useNavigate } from "react-router-dom";
import { Bot, Upload, Palette, Code, Zap, Shield, BarChart3, ArrowRight, Check } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Your Data",
    description: "PDFs, documents, websites — your chatbot learns from your content in minutes.",
  },
  {
    icon: Palette,
    title: "Customize Everything",
    description: "Match your brand colors, logo, and messaging. White-label ready.",
  },
  {
    icon: Code,
    title: "One Line to Embed",
    description: "Copy a single script tag. Works on any website, WordPress, React, or custom.",
  },
  {
    icon: Zap,
    title: "Multi-Model AI",
    description: "Choose Claude, GPT-4o, or run models locally. Pick the best fit for your use case.",
  },
  {
    icon: Shield,
    title: "Accurate Answers",
    description: "RAG technology ensures responses come from your data, not hallucinations.",
  },
  {
    icon: BarChart3,
    title: "Analytics Built In",
    description: "Track conversations, popular questions, and satisfaction scores.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For testing and personal projects",
    features: ["1 chatbot", "50 messages/month", "5 documents", "Community support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For small businesses and agencies",
    features: ["5 chatbots", "2,000 messages/month", "50 documents", "All AI models", "Priority support"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "/month",
    description: "For agencies and enterprises",
    features: ["Unlimited chatbots", "10,000 messages/month", "200 documents", "White-label", "Dedicated support", "Custom integrations"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-700" />
            <span className="text-xl font-bold text-gray-900">Respondiq</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Customer Support
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Turn your documents into an{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              intelligent chatbot
            </span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Upload your data, customize the look, embed on your site. Your AI assistant
            answers customer questions 24/7 — accurately, from your own content.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Start Building <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#features"
              className="px-8 py-3.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Three steps to launch</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload your data", desc: "PDFs, docs, URLs, or paste text. We chunk and embed it automatically." },
              { step: "2", title: "Customize your bot", desc: "Set your brand colors, welcome message, and AI behavior." },
              { step: "3", title: "Embed & go live", desc: "Copy one line of code. Your chatbot is live on your website." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Everything you need
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-center mb-12">Start free, upgrade when you grow.</p>

          <div className="grid grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 ${
                  plan.popular
                    ? "border-2 border-blue-600 shadow-lg relative"
                    : "border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/login")}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Respondiq by Cupertino Studios</span>
          </div>
          <p className="text-sm text-gray-400">Intelligent answers from your data</p>
        </div>
      </footer>
    </div>
  );
}
