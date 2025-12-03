import { useState } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { 
  Settings, Shield, Bell, Mail, MessageSquare, CreditCard, 
  Globe, Palette, Database, Users, Save, Loader2
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function PlatformSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Elite Cuisine",
    siteEmail: "contact@elitecuisine.com",
    supportEmail: "support@elitecuisine.com",
    maintenanceMode: false,
    registrationEnabled: true,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "noreply@elitecuisine.com",
    smtpPassword: "••••••••",
    emailFromName: "Elite Cuisine",
    emailFromAddress: "noreply@elitecuisine.com",
  });

  // SMS Settings
  const [smsSettings, setSmsSettings] = useState({
    smsProvider: "twilio",
    twilioAccountSid: "AC••••••••••••••",
    twilioAuthToken: "••••••••••••••••",
    twilioPhoneNumber: "+1234567890",
    smsEnabled: true,
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripePublicKey: "pk_test_••••••••••••••••",
    stripeSecretKey: "sk_test_••••••••••••••••",
    currency: "EGP",
    taxRate: "14",
    serviceFee: "5",
  });

  // Feature Flags
  const [featureFlags, setFeatureFlags] = useState({
    enableReservations: true,
    enableOrders: true,
    enableReviews: true,
    enableLoyaltyProgram: false,
    enableGiftCards: false,
    enableTableQueue: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Only admin can access this page
  if (!user || user.role !== 'admin') {
    return (
      <CustomerLayout>
        <div className="pt-32 pb-20 px-6 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-2xl text-white mb-4">
            {t('settings.accessDenied', 'Access Denied')}
          </h2>
          <p className="text-muted-foreground">
            {t('settings.adminOnly', 'This page is only accessible to administrators.')}
          </p>
        </div>
      </CustomerLayout>
    );
  }

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: t('settings.saved', 'Settings Saved'),
      description: t('settings.generalSaved', 'General settings have been updated.'),
    });
    setIsSaving(false);
  };

  const handleSaveEmail = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: t('settings.saved', 'Settings Saved'),
      description: t('settings.emailSaved', 'Email settings have been updated.'),
    });
    setIsSaving(false);
  };

  const handleSaveSms = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: t('settings.saved', 'Settings Saved'),
      description: t('settings.smsSaved', 'SMS settings have been updated.'),
    });
    setIsSaving(false);
  };

  const handleSavePayment = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: t('settings.saved', 'Settings Saved'),
      description: t('settings.paymentSaved', 'Payment settings have been updated.'),
    });
    setIsSaving(false);
  };

  const handleSaveFeatures = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: t('settings.saved', 'Settings Saved'),
      description: t('settings.featuresSaved', 'Feature flags have been updated.'),
    });
    setIsSaving(false);
  };

  return (
    <CustomerLayout>
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="font-heading text-4xl text-white">
                {t('settings.platformSettings', 'Platform Settings')}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {t('settings.platformDesc', 'Configure system-wide settings and integrations')}
            </p>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="general" className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <TabsList className="bg-card/50 border border-white/5 grid w-full grid-cols-5">
              <TabsTrigger value="general">
                <Globe className="w-4 h-4 mr-2" />
                {t('settings.general', 'General')}
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" />
                {t('settings.email', 'Email')}
              </TabsTrigger>
              <TabsTrigger value="sms">
                <MessageSquare className="w-4 h-4 mr-2" />
                {t('settings.sms', 'SMS')}
              </TabsTrigger>
              <TabsTrigger value="payment">
                <CreditCard className="w-4 h-4 mr-2" />
                {t('settings.payment', 'Payment')}
              </TabsTrigger>
              <TabsTrigger value="features">
                <Palette className="w-4 h-4 mr-2" />
                {t('settings.features', 'Features')}
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    {t('settings.generalSettings', 'General Settings')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('settings.generalDesc', 'Basic platform configuration')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="siteName" className="text-white/80">
                        {t('settings.siteName', 'Site Name')}
                      </Label>
                      <Input
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="siteEmail" className="text-white/80">
                        {t('settings.siteEmail', 'Site Email')}
                      </Label>
                      <Input
                        id="siteEmail"
                        type="email"
                        value={generalSettings.siteEmail}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteEmail: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="supportEmail" className="text-white/80">
                        {t('settings.supportEmail', 'Support Email')}
                      </Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={generalSettings.supportEmail}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-4">
                    <h3 className="text-white font-medium">
                      {t('settings.systemControls', 'System Controls')}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode" className="text-white/80 cursor-pointer">
                          {t('settings.maintenanceMode', 'Maintenance Mode')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.maintenanceModeDesc', 'Temporarily disable access to the platform')}
                        </p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="registrationEnabled" className="text-white/80 cursor-pointer">
                          {t('settings.userRegistration', 'User Registration')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.userRegistrationDesc', 'Allow new users to register')}
                        </p>
                      </div>
                      <Switch
                        id="registrationEnabled"
                        checked={generalSettings.registrationEnabled}
                        onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, registrationEnabled: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveGeneral}
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('common.saveChanges', 'Save Changes')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Settings */}
            <TabsContent value="email">
              <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    {t('settings.emailSettings', 'Email Settings')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('settings.emailDesc', 'Configure SMTP and email delivery')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpHost" className="text-white/80">
                        {t('settings.smtpHost', 'SMTP Host')}
                      </Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="smtpPort" className="text-white/80">
                        {t('settings.smtpPort', 'SMTP Port')}
                      </Label>
                      <Input
                        id="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="smtpUser" className="text-white/80">
                        {t('settings.smtpUser', 'SMTP Username')}
                      </Label>
                      <Input
                        id="smtpUser"
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="smtpPassword" className="text-white/80">
                        {t('settings.smtpPassword', 'SMTP Password')}
                      </Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emailFromName" className="text-white/80">
                        {t('settings.fromName', 'From Name')}
                      </Label>
                      <Input
                        id="emailFromName"
                        value={emailSettings.emailFromName}
                        onChange={(e) => setEmailSettings({ ...emailSettings, emailFromName: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emailFromAddress" className="text-white/80">
                        {t('settings.fromAddress', 'From Address')}
                      </Label>
                      <Input
                        id="emailFromAddress"
                        type="email"
                        value={emailSettings.emailFromAddress}
                        onChange={(e) => setEmailSettings({ ...emailSettings, emailFromAddress: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveEmail}
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('common.saveChanges', 'Save Changes')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SMS Settings */}
            <TabsContent value="sms">
              <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    {t('settings.smsSettings', 'SMS Settings')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('settings.smsDesc', 'Configure SMS notifications via Twilio')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Label htmlFor="smsEnabled" className="text-white/80 cursor-pointer">
                        {t('settings.enableSms', 'Enable SMS Notifications')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.enableSmsDesc', 'Send SMS notifications to users')}
                      </p>
                    </div>
                    <Switch
                      id="smsEnabled"
                      checked={smsSettings.smsEnabled}
                      onCheckedChange={(checked) => setSmsSettings({ ...smsSettings, smsEnabled: checked })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="twilioAccountSid" className="text-white/80">
                        {t('settings.twilioSid', 'Twilio Account SID')}
                      </Label>
                      <Input
                        id="twilioAccountSid"
                        value={smsSettings.twilioAccountSid}
                        onChange={(e) => setSmsSettings({ ...smsSettings, twilioAccountSid: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                        disabled={!smsSettings.smsEnabled}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="twilioAuthToken" className="text-white/80">
                        {t('settings.twilioToken', 'Twilio Auth Token')}
                      </Label>
                      <Input
                        id="twilioAuthToken"
                        type="password"
                        value={smsSettings.twilioAuthToken}
                        onChange={(e) => setSmsSettings({ ...smsSettings, twilioAuthToken: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                        disabled={!smsSettings.smsEnabled}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="twilioPhoneNumber" className="text-white/80">
                        {t('settings.twilioPhone', 'Twilio Phone Number')}
                      </Label>
                      <Input
                        id="twilioPhoneNumber"
                        value={smsSettings.twilioPhoneNumber}
                        onChange={(e) => setSmsSettings({ ...smsSettings, twilioPhoneNumber: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                        disabled={!smsSettings.smsEnabled}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveSms}
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('common.saveChanges', 'Save Changes')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payment">
              <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {t('settings.paymentSettings', 'Payment Settings')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('settings.paymentDesc', 'Configure payment gateway and pricing')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stripePublicKey" className="text-white/80">
                        {t('settings.stripePublicKey', 'Stripe Public Key')}
                      </Label>
                      <Input
                        id="stripePublicKey"
                        value={paymentSettings.stripePublicKey}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripePublicKey: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="stripeSecretKey" className="text-white/80">
                        {t('settings.stripeSecretKey', 'Stripe Secret Key')}
                      </Label>
                      <Input
                        id="stripeSecretKey"
                        type="password"
                        value={paymentSettings.stripeSecretKey}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="currency" className="text-white/80">
                        {t('settings.currency', 'Currency')}
                      </Label>
                      <Input
                        id="currency"
                        value={paymentSettings.currency}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, currency: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="taxRate" className="text-white/80">
                        {t('settings.taxRate', 'Tax Rate (%)')}
                      </Label>
                      <Input
                        id="taxRate"
                        value={paymentSettings.taxRate}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, taxRate: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="serviceFee" className="text-white/80">
                        {t('settings.serviceFee', 'Service Fee (%)')}
                      </Label>
                      <Input
                        id="serviceFee"
                        value={paymentSettings.serviceFee}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, serviceFee: e.target.value })}
                        className="bg-background/50 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSavePayment}
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('common.saveChanges', 'Save Changes')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feature Flags */}
            <TabsContent value="features">
              <Card className="bg-card/50 border-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    {t('settings.featureFlags', 'Feature Flags')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('settings.featuresDesc', 'Enable or disable platform features')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableReservations" className="text-white/80 cursor-pointer">
                        {t('settings.reservations', 'Reservations')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.reservationsDesc', 'Allow users to make table reservations')}
                      </p>
                    </div>
                    <Switch
                      id="enableReservations"
                      checked={featureFlags.enableReservations}
                      onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableReservations: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableOrders" className="text-white/80 cursor-pointer">
                        {t('settings.orders', 'Online Orders')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.ordersDesc', 'Enable food ordering system')}
                      </p>
                    </div>
                    <Switch
                      id="enableOrders"
                      checked={featureFlags.enableOrders}
                      onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableOrders: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableReviews" className="text-white/80 cursor-pointer">
                        {t('settings.reviews', 'Reviews & Ratings')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.reviewsDesc', 'Let users leave reviews and ratings')}
                      </p>
                    </div>
                    <Switch
                      id="enableReviews"
                      checked={featureFlags.enableReviews}
                      onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableReviews: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableLoyaltyProgram" className="text-white/80 cursor-pointer">
                        {t('settings.loyaltyProgram', 'Loyalty Program')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.loyaltyProgramDesc', 'Reward customers with points and perks')}
                      </p>
                    </div>
                    <Switch
                      id="enableLoyaltyProgram"
                      checked={featureFlags.enableLoyaltyProgram}
                      onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableLoyaltyProgram: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableGiftCards" className="text-white/80 cursor-pointer">
                        {t('settings.giftCards', 'Gift Cards')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.giftCardsDesc', 'Allow purchase and use of gift cards')}
                      </p>
                    </div>
                    <Switch
                      id="enableGiftCards"
                      checked={featureFlags.enableGiftCards}
                      onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableGiftCards: checked })}
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableTableQueue" className="text-white/80 cursor-pointer">
                        {t('settings.tableQueue', 'Table Queue System')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.tableQueueDesc', 'Virtual queue for walk-in customers')}
                      </p>
                    </div>
                    <Switch
                      id="enableTableQueue"
                      checked={featureFlags.enableTableQueue}
                      onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, enableTableQueue: checked })}
                    />
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button
                      onClick={handleSaveFeatures}
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('common.saveChanges', 'Save Changes')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CustomerLayout>
  );
}
