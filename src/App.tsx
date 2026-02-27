import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";
import Prompts from "./pages/Prompts";
import PromptDetail from "./pages/PromptDetail";
import Agency from "./pages/Agency";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import Courses from "./pages/Courses";
import CoursePayment from "./pages/CoursePayment";
import CourseLessonView from "./pages/CourseLessonView";
import FAQ from "./pages/FAQ";
import HelpCenter from "./pages/HelpCenter";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PaymentTerms from "./pages/PaymentTerms";
import Contact from "./pages/Contact";
import Community from "./pages/Community";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPrompts from "./pages/admin/AdminPrompts";
import AdminPromptForm from "./pages/admin/AdminPromptForm";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminLessonForm from "./pages/admin/AdminLessonForm";
import AdminPricingPlans from "./pages/admin/AdminPricingPlans";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseForm from "./pages/admin/AdminCourseForm";
import AdminCourseLessons from "./pages/admin/AdminCourseLessons";
import AdminCourseLessonForm from "./pages/admin/AdminCourseLessonForm";
import AdminPaymentMethods from "./pages/admin/AdminPaymentMethods";
import AdminReferralWithdrawals from "./pages/admin/AdminReferralWithdrawals";
import AdminReminders from "./pages/admin/AdminReminders";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/prompt/:slug" element={<PromptDetail />} />
            <Route path="/agency" element={<Agency />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lessons/:slug" element={<LessonDetail />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course-payment/:slug" element={<CoursePayment />} />
            <Route path="/course/:courseSlug/lesson/:lessonSlug" element={<CourseLessonView />} />
            <Route path="/course/:courseSlug" element={<CourseLessonView />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/payment-terms" element={<PaymentTerms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="prompts" element={<AdminPrompts />} />
              <Route path="prompts/new" element={<AdminPromptForm />} />
              <Route path="prompts/:id/edit" element={<AdminPromptForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="lessons" element={<AdminLessons />} />
              <Route path="lessons/new" element={<AdminLessonForm />} />
              <Route path="lessons/:id/edit" element={<AdminLessonForm />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/new" element={<AdminCourseForm />} />
              <Route path="courses/:id/edit" element={<AdminCourseForm />} />
              <Route path="courses/:courseId/lessons" element={<AdminCourseLessons />} />
              <Route path="courses/:courseId/lessons/new" element={<AdminCourseLessonForm />} />
              <Route path="courses/:courseId/lessons/:lessonId/edit" element={<AdminCourseLessonForm />} />
              <Route path="pricing" element={<AdminPricingPlans />} />
              <Route path="payment-methods" element={<AdminPaymentMethods />} />
              <Route path="referral-withdrawals" element={<AdminReferralWithdrawals />} />
              <Route path="reminders" element={<AdminReminders />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
