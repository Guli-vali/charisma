# Quick Start Guide: Module 6 - Profile & Settings

## 🚀 Getting Started

This guide will help you set up and use Module 6 features in your Charisma Pro application.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Module 1-5 completed
- ✅ PocketBase running locally
- ✅ User authentication working
- ✅ At least one test user account

## 🔧 Setup (5 minutes)

### Step 1: Create Database Collections

1. Open PocketBase Admin: `http://127.0.0.1:8090/_/`
2. Go to **Collections** → **New Collection**
3. Follow instructions in [`POCKETBASE_MODULE6_SETUP.md`](../setup/pocketbase/POCKETBASE_MODULE6_SETUP.md)

**Quick SQL (copy-paste into PocketBase console):**

```sql
-- Create user_settings collection (manual via UI)
-- Create user_stats collection (manual via UI)

-- Then run initialization:
-- See POCKETBASE_MODULE6_SETUP.md for full script
```

### Step 2: Initialize Existing Users

If you have existing users, initialize their settings and stats:

```typescript
import { initializeUserProfile } from '@/lib/profile';

// Call after user registration or login
await initializeUserProfile(userId);
```

### Step 3: Test the Pages

Visit these URLs to verify setup:

1. **Profile:** `http://localhost:3000/profile`
2. **Settings:** `http://localhost:3000/settings`
3. **Stats:** `http://localhost:3000/stats`

## 🎯 Features Overview

### 1. Profile Page

**URL:** `/profile`

**What you can do:**
- View your avatar (click to change)
- See your level, XP, and league
- Check your statistics (lessons, missions, streak)
- View activity calendar (365 days)
- See skills progress
- Edit profile details

**Try this:**
```typescript
// Update profile
import { updateUserProfile } from '@/lib/profile';

await updateUserProfile(userId, {
  name: 'John Doe',
  bio: 'Learning social skills!',
});
```

### 2. Settings Page

**URL:** `/settings`

**Tabs:**
1. 🔔 **Notifications** - Configure reminders
2. 🎨 **Appearance** - Theme and language
3. 🎯 **Goals** - Weekly targets
4. 🔒 **Privacy** - Visibility settings
5. 👤 **Account** - Email, password, export

**Try this:**
```typescript
// Update settings
import { updateUserSettings } from '@/lib/profile';

await updateUserSettings(userId, {
  theme: 'dark',
  weekly_goal: 14,
  notifications_enabled: true,
});
```

### 3. Stats Page

**URL:** `/stats`

**Features:**
- Progress charts (week/month/year)
- XP earnings over time
- Skills breakdown
- Activity patterns
- Insights & recommendations

### 4. Avatar Upload

**How to use:**
1. Click on avatar in profile
2. Select image (max 2MB)
3. Preview appears
4. Click "Upload"
5. Done! ✨

**Programmatically:**
```typescript
import { uploadAvatar } from '@/lib/profile';

const file = document.getElementById('file-input').files[0];
await uploadAvatar(userId, file);
```

### 5. Data Export

**How to export:**
1. Go to Settings → Account tab
2. See export summary
3. Click "Export Data"
4. JSON file downloads automatically

**Programmatically:**
```typescript
import { exportAndDownload } from '@/lib/dataExport';

await exportAndDownload(userId);
// Downloads: charisma-pro-backup-2024-11-04.json
```

## 📱 Testing Checklist

Run through these tests:

### Profile
- [ ] Avatar displays (or shows initials)
- [ ] Click avatar opens upload modal
- [ ] Upload image < 2MB works
- [ ] Upload image > 2MB shows error
- [ ] Profile stats show real numbers
- [ ] Activity calendar renders
- [ ] Skills tree displays
- [ ] Edit profile button works
- [ ] Save changes persists

### Settings
- [ ] All 5 tabs switch correctly
- [ ] Theme changes apply immediately
- [ ] Notifications permission requested
- [ ] Reminder time picker works
- [ ] Weekly goal slider responds
- [ ] Privacy settings save
- [ ] Email change validates password
- [ ] Password change works
- [ ] Export downloads JSON
- [ ] Delete account asks confirmation

### Stats
- [ ] Charts render
- [ ] Time range selector works (week/month/year)
- [ ] XP graph displays
- [ ] Skills breakdown shows
- [ ] Insights are relevant
- [ ] No console errors

### Responsive
- [ ] Mobile: Single column, all features accessible
- [ ] Tablet: 2-3 columns, optimized layout
- [ ] Desktop: Full layout, hover effects work

## 🐛 Common Issues & Fixes

### Issue: "Settings not found"
**Fix:** Initialize user settings
```typescript
import { createDefaultSettings } from '@/lib/profile';
await createDefaultSettings(userId);
```

### Issue: "Stats showing 0"
**Fix:** Refresh stats from source data
```typescript
import { refreshUserStats } from '@/lib/profile';
await refreshUserStats(userId);
```

### Issue: "Avatar not displaying"
**Fix:** Check PocketBase file upload configuration
```typescript
// Verify avatar field exists in users collection
// Max file size should be 2MB minimum
```

### Issue: "Notifications not working"
**Fix:** Check browser permissions
```typescript
import { requestNotificationPermission } from '@/lib/notifications';
const permission = await requestNotificationPermission();
console.log('Permission:', permission);
```

### Issue: "Activity calendar empty"
**Fix:** Complete at least one lesson or mission
```typescript
// Calendar shows activity from completed lessons/missions
// Need data in lesson_progress or daily_missions collections
```

## 💡 Usage Tips

### 1. Personalize Profile Early
- Upload avatar
- Fill bio
- Select learning goals
- Makes the experience more engaging

### 2. Set Realistic Goals
- Start with 7 lessons/week
- Increase gradually
- Track progress in stats

### 3. Use Notifications Wisely
- Enable reminders
- Set time that works for you
- Don't over-notify

### 4. Check Stats Regularly
- Weekly review motivates
- Identify patterns
- Adjust strategy

### 5. Export Data Periodically
- Monthly backup recommended
- Before major updates
- For peace of mind

## 🎨 Customization

### Change Default Theme

Edit `lib/profile.ts`:
```typescript
// Line ~180
theme: 'dark', // Change default from 'auto'
```

### Adjust Weekly Goal Range

Edit `app/settings/page.tsx`:
```typescript
// Line ~XXX
<input type="range" min="1" max="50" /> // Increase from 21
```

### Modify Avatar Size Limit

Edit `lib/profile.ts`:
```typescript
// Line ~95
if (file.size > 5 * 1024 * 1024) { // Increase from 2MB
```

### Add Custom Stat Cards

Edit `components/profile/ProfileStats.tsx`:
```typescript
const statCards: StatCard[] = [
  // ... existing cards
  {
    label: 'Custom Metric',
    value: customValue,
    icon: <CustomIcon />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];
```

## 🔗 Integration Examples

### With Dashboard
```typescript
// Link to profile from dashboard
<Link href="/profile" className="...">
  View Profile
</Link>
```

### With Achievements
```typescript
// Send notification when achievement unlocked
import { sendAchievementNotification } from '@/lib/notifications';

await sendAchievementNotification(
  userId,
  'First Steps',
  'Complete your first lesson',
  50
);
```

### With Lessons
```typescript
// Update stats after lesson completion
import { updateUserStats, refreshUserStats } from '@/lib/profile';

// Option 1: Incremental update
await updateUserStats(userId, {
  total_lessons: stats.total_lessons + 1,
  total_xp: stats.total_xp + 50,
});

// Option 2: Full refresh
await refreshUserStats(userId);
```

### With Streak System
```typescript
// Check streak and send warnings
import { sendStreakWarning } from '@/lib/notifications';

if (stats.current_streak > 7 && !completedToday) {
  await sendStreakWarning(userId, stats.current_streak);
}
```

## 📊 Monitoring

### Track Usage
```typescript
// Log key actions
console.log('Profile viewed:', userId);
console.log('Settings updated:', settingKey);
console.log('Avatar uploaded:', fileName);
console.log('Data exported:', exportSize);
```

### Performance
```typescript
// Measure page load times
console.time('profile-load');
await loadProfileData();
console.timeEnd('profile-load');
```

## 🎓 Best Practices

### 1. Error Handling
Always wrap API calls in try-catch:
```typescript
try {
  await updateUserProfile(userId, data);
} catch (error) {
  console.error('Profile update failed:', error);
  showErrorToast('Failed to save profile');
}
```

### 2. Loading States
Show feedback during operations:
```typescript
setLoading(true);
try {
  await longOperation();
} finally {
  setLoading(false);
}
```

### 3. Optimistic Updates
Update UI immediately, revert on error:
```typescript
const oldValue = value;
setValue(newValue); // Optimistic

try {
  await updateServer(newValue);
} catch {
  setValue(oldValue); // Revert
}
```

### 4. Data Validation
Validate before sending:
```typescript
if (!email.includes('@')) {
  return showError('Invalid email');
}
if (password.length < 8) {
  return showError('Password too short');
}
```

## 📚 Next Steps

After Module 6:

1. **Test Everything** - Run through full user journey
2. **Gather Feedback** - From real users
3. **Monitor Usage** - Which features are popular?
4. **Iterate** - Improve based on data
5. **Module 7** - Deployment & Production

## 🆘 Need Help?

1. Check [Main README](../README.md)
2. Review [Module 6 README](../modules/module6/MODULE6_PROFILE_README.md)
3. Inspect browser console for errors
4. Check PocketBase logs
5. Verify database collections exist

## 🎉 Success!

If you can:
- ✅ View and edit your profile
- ✅ Upload an avatar
- ✅ Change settings
- ✅ See statistics and charts
- ✅ Export your data

**Congratulations!** Module 6 is working perfectly! 🎊

---

**Ready for Module 7: Deployment?** Let's make Charisma Pro production-ready! 🚀

