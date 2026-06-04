import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/Card";
import { Switch } from "@/ui/Switch";
import { Separator } from "@/ui/Separator";

interface NotificationSettingsProps {
  preferences: any;
  updatePreferences: (prefs: any) => void;
}

const EMAIL_NOTIFICATIONS = [
  {
    key: 'email_notifications',
    label: 'Email Notifications',
    desc: 'Receive account alerts, order confirmations, and daily digests via email',
  },
  {
    key: 'order_updates',
    label: 'Order Updates',
    desc: 'Get notified when your order status changes (shipped, delivered, cancelled)',
  },
  {
    key: 'marketing_emails',
    label: 'Marketing Emails',
    desc: 'Receive special offers, sale alerts, and platform newsletters',
  },
];

const SMS_NOTIFICATIONS = [
  {
    key: 'sms_notifications',
    label: 'Mobile Notifications (SMS)',
    desc: 'Get critical order updates and security alerts via SMS to your registered mobile number',
  },
  {
    key: 'sales_booster_sms',
    label: 'Sales Booster Messages',
    desc: 'Receive promotional SMS about deals, flash sales, and exclusive offers (Ads & Marketing)',
  },
];

export const NotificationSettings = ({ preferences, updatePreferences }: NotificationSettingsProps) => {
  if (!preferences) {
    return (
      <Card className="border-none shadow-lg">
         <CardContent className="p-6">
           <div className="flex items-center justify-center p-4">Loading preferences...</div>
         </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-xl md:text-2xl">Notifications</CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-0 p-4 md:p-6 pt-0">

        {/* ─── Email Section ────────────────────────────────────── */}
        <div className="mb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">
            Email
          </p>
          <div className="space-y-1">
            {EMAIL_NOTIFICATIONS.map((item) => (
              <div
                key={item.key}
                className="flex items-start md:items-center justify-between gap-4 p-3 rounded-xl hover:bg-muted/50 transition"
              >
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm md:text-base font-medium leading-none">{item.label}</p>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                <Switch
                  checked={preferences[item.key] || false}
                  onCheckedChange={(c) => updatePreferences({ [item.key]: c })}
                  className="shrink-0 mt-0.5 md:mt-0"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* ─── SMS Section ──────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">
            SMS &amp; Mobile
          </p>
          <div className="space-y-1">
            {SMS_NOTIFICATIONS.map((item) => (
              <div
                key={item.key}
                className="flex items-start md:items-center justify-between gap-4 p-3 rounded-xl hover:bg-muted/50 transition"
              >
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm md:text-base font-medium leading-none">{item.label}</p>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                <Switch
                  checked={preferences[item.key] || false}
                  onCheckedChange={(c) => updatePreferences({ [item.key]: c })}
                  className="shrink-0 mt-0.5 md:mt-0"
                />
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
