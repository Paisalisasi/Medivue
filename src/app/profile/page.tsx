import AuthGuard from '@/components/organisms/auth/AuthGuard';
import ProfilePanel from '@/components/organisms/profile/ProfilePanel';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="profile-fullscreen relative min-h-dvh overflow-hidden bg-surface pb-28 pt-8 sm:py-12">
        {/* Ambient glow agar panel terasa mengambang seperti kaca. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-8">
          <div className="rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_24px_70px_-30px_rgba(22,39,61,.35)] backdrop-blur-2xl backdrop-saturate-150 sm:p-8">
            <ProfilePanel variant="page" />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
