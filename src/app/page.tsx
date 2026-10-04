import Link from "next/link";

import { AccuracyByTopic } from "@/components/dashboard/accuracy-by-topic";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { CountedValue } from "@/components/dashboard/counted-value";
import { FriendsLeaderboard } from "@/components/dashboard/friends-leaderboard";
import { MarginCallCard } from "@/components/dashboard/margin-call-card";
import { Panel } from "@/components/dashboard/panel";
import { SkillRoadmap } from "@/components/dashboard/skill-roadmap";
import { Sparkline } from "@/components/dashboard/sparkline";
import { StatCard } from "@/components/dashboard/stat-card";
import { TakeoverCard } from "@/components/dashboard/takeover-card";
import { TickerBar } from "@/components/dashboard/ticker-bar";
import { mockActivity } from "@/data/mock/activity";
import { mockFriends, mockTicker } from "@/data/mock/friends";
import { mockRoadmap } from "@/data/mock/roadmap";
import { mockTopics } from "@/data/mock/topics";
import { mockUser } from "@/data/mock/user";

export default function DashboardPage() {
  const user = mockUser;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4 lg:p-6">
      <TickerBar items={mockTicker} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Weekly XP"
          value={<CountedValue value={user.weeklyXp} />}
          note="180 above last week"
          trend="up"
          chart={<Sparkline values={user.weeklyXpSeries} label="Daily XP over the last 7 days" />}
        />
        <StatCard
          label="Current Streak"
          value={<CountedValue value={user.streakDays} delayMs={120} />}
          note="days — personal best is 18"
        />
        <StatCard
          label="Accuracy"
          value={<CountedValue value={user.accuracy} decimals={1} suffix="%" delayMs={240} />}
          note="1.2 points this week"
          trend="up"
        />
        <StatCard
          label="Rank"
          // Not counted: rank is an ordinal, not a magnitude. Counting up to it reads
          // backwards (a bigger number is worse) and shows a nonsense "#0" on the way.
          value={`#${user.globalRank.toLocaleString()}`}
          note={`${user.friendsRank} of ${user.friendsTotal} among friends`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MarginCallCard />
        <TakeoverCard />
      </div>

      <Panel
        label="Track"
        action={
          <span className="font-mono text-[11px] text-muted tabular-nums">
            3 / {mockRoadmap.length} complete
          </span>
        }
      >
        <SkillRoadmap nodes={mockRoadmap} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Accuracy by topic">
          <AccuracyByTopic topics={mockTopics} />
        </Panel>

        <Panel
          label="Friends this week"
          action={
            <Link
              href="/leaderboard"
              className="font-mono text-[11px] text-muted transition-colors hover:text-accent"
            >
              View all
            </Link>
          }
        >
          <FriendsLeaderboard friends={mockFriends} currentHandle={user.handle} />
        </Panel>
      </div>

      <Panel label="Activity — last 12 weeks">
        <ActivityHeatmap days={mockActivity} />
      </Panel>
    </div>
  );
}
