/**
 * Migration Script: Migrate Existing Users to Supabase Auth
 * 
 * Bu script tüm mevcut user'ları Supabase Auth'a ekler.
 * Tek seferlik çalıştırılmalı.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

// Create admin client directly
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function migrateUsersToSupabaseAuth() {
  console.log('🚀 Starting user migration to Supabase Auth...\n');

  try {
    // 1. Tüm user'ları al
    console.log('📊 Fetching all users from database...');
    const { data: users, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, created_at')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No users found in database.');
      process.exit(0);
    }

    console.log(`✅ Found ${users.length} users to migrate.\n`);

    // 2. Her user için Supabase Auth'a ekle
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`Processing: ${user.email} (${user.id})`);

        // Check if user already exists in Supabase Auth
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(user.id);

        if (existingUser?.user) {
          console.log(`  ⏭️  Already exists in Supabase Auth - skipping`);
          skipCount++;
          continue;
        }

        // Create user in Supabase Auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          id: user.id,
          email: user.email,
          email_confirm: true, // Auto-confirm since they're existing users
          user_metadata: {
            name: user.name,
            migrated_at: new Date().toISOString(),
          },
        });

        if (createError) {
          console.error(`  ❌ Error creating user: ${createError.message}`);
          errorCount++;
          continue;
        }

        console.log(`  ✅ Successfully migrated to Supabase Auth`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ Unexpected error:`, error);
        errorCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 3. Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(50));
    console.log(`Total users:        ${users.length}`);
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⏭️  Already existed:      ${skipCount}`);
    console.log(`❌ Errors:               ${errorCount}`);
    console.log('='.repeat(50));

    if (errorCount > 0) {
      console.log('\n⚠️  Some users failed to migrate. Check errors above.');
      process.exit(1);
    } else {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('1. Check Supabase Dashboard → Authentication → Users');
      console.log('2. Verify all users are present');
      console.log('3. Test login with existing users');
      console.log('4. RLS policies should now work with auth.uid()');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migrateUsersToSupabaseAuth();
