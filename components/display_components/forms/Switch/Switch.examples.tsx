import React, { useState } from 'react';
import SwitchComponent from './Switch';

// Example 1: Basic Switch
export const BasicSwitch = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Basic Switch</h3>
    <SwitchComponent id="airplane-mode" label="Airplane Mode" />
  </div>
);

// Example 2: Controlled Switch
export const ControlledSwitch = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Controlled Switch</h3>
      <div className="space-y-2">
        <SwitchComponent
          id="controlled-switch"
          label={`Notifications ${isEnabled ? 'Enabled' : 'Disabled'}`}
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
        />
        <p className="text-sm text-muted-foreground">
          Current state: {isEnabled ? 'ON' : 'OFF'}
        </p>
      </div>
    </div>
  );
};

// Example 3: Settings Panel
export const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: false,
    darkMode: true,
    emailUpdates: false,
  });

  const updateSetting = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Settings Panel</h3>
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-medium">Preferences</h4>
        <div className="space-y-3">
          <SwitchComponent
            id="notifications"
            label="Push Notifications"
            checked={settings.notifications}
            onCheckedChange={updateSetting('notifications')}
          />
          <SwitchComponent
            id="auto-save"
            label="Auto Save"
            checked={settings.autoSave}
            onCheckedChange={updateSetting('autoSave')}
          />
          <SwitchComponent
            id="dark-mode"
            label="Dark Mode"
            checked={settings.darkMode}
            onCheckedChange={updateSetting('darkMode')}
          />
          <SwitchComponent
            id="email-updates"
            label="Email Updates"
            checked={settings.emailUpdates}
            onCheckedChange={updateSetting('emailUpdates')}
          />
        </div>
      </div>
    </div>
  );
};

// Example 4: Disabled Switch
export const DisabledSwitch = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Disabled Switch</h3>
    <div className="space-y-2">
      <SwitchComponent
        id="disabled-on"
        label="Disabled (On)"
        checked={true}
        disabled
      />
      <SwitchComponent
        id="disabled-off"
        label="Disabled (Off)"
        checked={false}
        disabled
      />
    </div>
  </div>
);

// Example 5: Form Integration
export const FormIntegration = () => {
  const [formData, setFormData] = useState({
    termsAccepted: false,
    newsletterSubscription: false,
    twoFactorAuth: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form submitted! Check console for data.');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Form Integration</h3>
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
        <div className="space-y-3">
          <SwitchComponent
            id="terms"
            label="I accept the terms and conditions"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, termsAccepted: checked }))
            }
          />
          <SwitchComponent
            id="newsletter"
            label="Subscribe to newsletter"
            checked={formData.newsletterSubscription}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, newsletterSubscription: checked }))
            }
          />
          <SwitchComponent
            id="2fa"
            label="Enable two-factor authentication"
            checked={formData.twoFactorAuth}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, twoFactorAuth: checked }))
            }
          />
        </div>
        <button 
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          disabled={!formData.termsAccepted}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

// Export all examples
export const examples = [
  {
    name: 'Basic Switch',
    component: BasicSwitch,
  },
  {
    name: 'Controlled Switch',
    component: ControlledSwitch,
  },
  {
    name: 'Settings Panel',
    component: SettingsPanel,
  },
  {
    name: 'Disabled Switch',
    component: DisabledSwitch,
  },
  {
    name: 'Form Integration',
    component: FormIntegration,
  },
]; 