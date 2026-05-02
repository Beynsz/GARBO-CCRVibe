"use client";

import { useState }          from "react";
import { Button }             from "@/components/atoms/Button";
import { IncidentForm }       from "@/components/organisms/IncidentForm";
import { IncidentLogTable }   from "@/components/organisms/IncidentLogTable";
import { Badge }              from "@/components/atoms/Badge";
import type { IncidentWithSitio } from "@/types/app.types";
import type { SitioRow }          from "@/types/database.types";

interface AlertsClientProps {
  incidents: IncidentWithSitio[];
  sitios:    SitioRow[];
}

export function AlertsClient({ incidents, sitios }: AlertsClientProps) {
  const [showForm, setShowForm] = useState(false);

  const recentCount = incidents.filter((i) => {
    const d = new Date(i.incident_date);
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="animate-fade-in max-w-[1360px]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <div className="flex items-center gap-3">
            <h2 className="page-header__title">Alerts</h2>
            {recentCount > 0 && <Badge variant="danger">{recentCount} this week</Badge>}
          </div>
          <p className="page-header__subtitle">
            Incident log · Last 30 days · {incidents.length} records
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowForm(true)}
          leftIcon={<span className="text-base leading-none">+</span>}
        >
          Log Incident
        </Button>
      </div>

      <IncidentLogTable incidents={incidents} sitios={sitios} />

      {showForm && (
        <IncidentForm sitios={sitios} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}