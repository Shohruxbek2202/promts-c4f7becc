import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Payment = lazy(() => import("./pages/Payment"));
const Prompts = lazy(() => import("./pages/Prompts"));
const PromptDetail = lazy(() => import("./pages/PromptDetail"));
const Agency = lazy(() => import("./pages/Agency"));
const Lessons = lazy(() => import("./pages/Lessons"));
const LessonDetail = lazy(() => import("./pages/LessonDetail"));
const Courses = lazy(() => import("./pages/Courses"));
const CoursePayment = lazy(() => import("./pages/CoursePayment"));
const CourseLessonView = lazy(() => import("./pages/CourseLessonView"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const PaymentTerms = lazy(() => import("./pages/PaymentTerms"));
const Contact = lazy(() => import("./pages/Contact"));
const Community = lazy(() => import("./pages/Community"));
const Guides = lazy(() => import("./pages/Guides"));
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPrompts = lazy(() => import("./pages/admin/AdminPrompts"));
const AdminPromptForm = lazy(() => import("./pages/admin/AdminPromptForm"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminLessons = lazy(() => import("./pages/admin/AdminLessons"));
const AdminLessonForm = lazy(() => import("./pages/admin/AdminLessonForm"));
const AdminPricingPlans = lazy(() => import("./pages/admin/AdminPricingPlans"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminCourseForm = lazy(() => import("./pages/admin/AdminCourseForm"));
const AdminCourseLessons = lazy(() => import("./pages/admin/AdminCourseLessons"));
const AdminCourseLessonForm = lazy(() => import("./pages/admin/AdminCourseLessonForm"));
const AdminPaymentMethods = lazy(() => import("./pages/admin/AdminPaymentMethods"));
const AdminReferralWithdrawals = lazy(() => import("./pages/admin/AdminReferralWithdrawals"));
const AdminReminders = lazy(() => import("./pages/admin/AdminReminders"));
const AdminGuides = lazy(() => import("./pages/admin/AdminGuides"));
const AdminGuideForm = lazy(() => import("./pages/admin/AdminGuideForm"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:slug" element={<GuideDetail />} />
              
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
                <Route path="guides" element={<AdminGuides />} />
                <Route path="guides/new" element={<AdminGuideForm />} />
                <Route path="guides/:id/edit" element={<AdminGuideForm />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
