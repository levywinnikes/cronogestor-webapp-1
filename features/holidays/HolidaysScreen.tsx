"use client";

import { Header } from "@/components/Header";
import {
  holidayService,
  HolidayDto,
  HolidayType,
} from "@/app/services/holiday.service";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageShell, PageMain } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppButton } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/ui/form-field";

const HOLIDAY_TYPE_OPTIONS: Array<{ value: HolidayType; label: string }> = [
  { value: "ORGANIZACAO", label: "Organização" },
  { value: "NACIONAL", label: "Nacional" },
  { value: "ESTADUAL", label: "Estadual" },
  { value: "MUNICIPAL", label: "Municipal" },
];

export default function HolidaysScreen() {
  const { t } = useTranslation();

  const [holidays, setHolidays] = useState<HolidayDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<HolidayType>("ORGANIZACAO");

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const data = await holidayService.getHolidays();
        setHolidays(data);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : t("holidays.errors.loadFailed");
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolidays();
  }, [t]);

  const handleAddHoliday = async () => {
    if (!date || !name.trim()) {
      setErrorMsg(t("holidays.errors.requiredFields"));
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    try {
      const holiday = await holidayService.addHoliday({
        date,
        name: name.trim(),
        type,
      });
      setHolidays((current) =>
        [...current, holiday].sort(
          (a, b) => +new Date(a.date) - +new Date(b.date),
        ),
      );
      setDate("");
      setName("");
      setType("ORGANIZACAO");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("holidays.errors.saveFailed");
      setErrorMsg(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    setErrorMsg("");
    try {
      await holidayService.deleteHoliday(id);
      setHolidays((current) => current.filter((item) => item.id !== id));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("holidays.errors.deleteFailed");
      setErrorMsg(message);
    }
  };

  return (
    <PageShell>
      <Header />

      <PageHeader
        title={t("holidays.page.title")}
        icon={<CalendarDays className="h-6 w-6" />}
      />

      <PageMain className="max-w-7xl space-y-6">
        {/* Add form */}
        <Card>
          <CardHeader title={t("holidays.page.addTitle")} />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
              <TextField
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("holidays.placeholders.name")}
                wrapperClassName="md:col-span-2"
              />
              <SelectField
                value={type}
                onChange={(event) =>
                  setType(event.target.value as HolidayType)
                }
                options={HOLIDAY_TYPE_OPTIONS}
              />
            </div>
            <div className="mt-4">
              <AppButton
                variant="secondary"
                icon={<Plus className="w-4 h-4" />}
                loading={isSaving}
                onClick={handleAddHoliday}
              >
                {t("holidays.buttons.add")}
              </AppButton>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader title={t("holidays.page.listTitle")} />
          {isLoading ? (
            <CardContent className="divide-y divide-border-light p-0">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between gap-3">
                  <div className="space-y-2 flex-1 animate-pulse">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-9 w-20 rounded-xl" />
                </div>
              ))}
            </CardContent>
          ) : holidays.length === 0 ? (
            <CardContent>
              <p className="text-sm text-text-secondary">
                {t("holidays.states.empty")}
              </p>
            </CardContent>
          ) : (
            <div className="divide-y divide-border-light">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="px-6 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">
                      {holiday.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(holiday.date).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                      })}{" "}
                      - {t(`holidays.types.${holiday.type.toLowerCase()}`)}
                    </p>
                  </div>
                  <AppButton
                    variant="danger-outline"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleDeleteHoliday(holiday.id)}
                  >
                    {t("holidays.buttons.delete")}
                  </AppButton>
                </div>
              ))}
            </div>
          )}
        </Card>

        {errorMsg ? (
          <div className="p-4 bg-danger-100 border border-red-200 rounded-lg text-danger text-sm">
            {errorMsg}
          </div>
        ) : null}
      </PageMain>
    </PageShell>
  );
}
