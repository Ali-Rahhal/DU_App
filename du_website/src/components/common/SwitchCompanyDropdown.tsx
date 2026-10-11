import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Building2 } from "lucide-react";
import { toast } from "react-toastify";

import { getCompanies } from "@/utils/apiCalls";
import { Companies, CompanyId } from "@/utils/config_companies";
import { useCompanyStore } from "@/store/zustand";

interface Props {
  onSwitched?: () => void;
}

export default function SwitchCompanyDropdown({ onSwitched }: Props) {
  const [companies, setCompanies] = useState<CompanyId[]>([]);
  const [switching, setSwitching] = useState(false);

  const companyId = useCompanyStore((s) => s.companyId);
  const switchCompany = useCompanyStore((s) => s.switchCompany);

  useEffect(() => {
    getCompanies()
      .then((res) =>
        setCompanies(
          (res.data.result ?? []).map(
            (c: { companyId: CompanyId }) => c.companyId,
          ),
        ),
      )
      .catch(() => setCompanies([]));
  }, []);

  // Nothing to switch to
  if (companies.length < 2) return null;

  const handleSelect = async (id: CompanyId) => {
    if (id === companyId || switching) return;

    setSwitching(true);
    try {
      await switchCompany(id);
      onSwitched?.();
      // Full reload so every page refetches data for the new company
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to switch company");
      setSwitching(false);
    }
  };

  return (
    <div className="sidebar-settings-row">
      <Building2 size={18} />

      <Dropdown className="w-50">
        <Dropdown.Toggle
          variant="light"
          className="language-toggle"
          disabled={switching}
        >
          {Companies[companyId]?.abreviation ?? companyId}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {companies.map((id) => (
            <Dropdown.Item
              key={id}
              active={id === companyId}
              onClick={() => handleSelect(id)}
            >
              {Companies[id]?.name ?? id}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
