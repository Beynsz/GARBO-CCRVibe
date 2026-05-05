"use client";

import { useState }              from "react";
import { Button }                from "@/components/atoms/Button";
import { AnnouncementPanel }     from "@/components/organisms/AnnouncementPanel";
import { AnnouncementForm }      from "@/components/organisms/AnnouncementForm";
import type { AnnouncementRow }  from "@/types/database.types";

interface AnnouncementsClientProps {
  announcements: AnnouncementRow[];
}

export function AnnouncementsClient({ announcements }: AnnouncementsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const activeCount = announcements.filter((a) => a.is_active).length;

  return (
    <div className="animate-fade-in max-w-[860px]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h2 className="page-header__title">Announcements</h2>
          <p className="page-header__subtitle">
            {announcements.length} total · {activeCount} active
          </p>
        </div>
        <Button
          variant="primary" size="sm"
          onClick={() => setShowForm(true)}
          leftIcon={<span className="text-base leading-none">+</span>}
        >
          Create Announcement
        </Button>
      </div>

      <AnnouncementPanel announcements={announcements} />

      {showForm && (
        <AnnouncementForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}