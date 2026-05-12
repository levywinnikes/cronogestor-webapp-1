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

const HOLIDAY_TYPES: HolidayType[] = [
  "NACIONAL",
  "ESTADUAL",
  "MUNICIPAL",
  "ORGANIZACAO",
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
    <div className="min-h-screen bg-[#f3f6f9] flex flex-col font-sans">
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-[#002f5c]" />
          <h2 className="text-2xl font-bold text-gray-900">
            {t("holidays.page.title")}
          </h2>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {t("holidays.page.addTitle")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("holidays.placeholders.name")}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm md:col-span-2"
            />
            <select
              value={type}
              onChange={(event) => setType(event.target.value as HolidayType)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            >
              {HOLIDAY_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`holidays.types.${value.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <button
              onClick={handleAddHoliday}
              disabled={isSaving}
              className="px-4 py-2 bg-[#2c9644] hover:bg-[#237836] text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t("holidays.buttons.add")}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              {t("holidays.page.listTitle")}
            </h3>
          </div>

          {isLoading ? (
            <div className="p-6 text-sm text-gray-500">
              {t("holidays.states.loading")}
            </div>
          ) : holidays.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              {t("holidays.states.empty")}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="px-4 md:px-6 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {holiday.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(holiday.date).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                      })}{" "}
                      - {t(`holidays.types.${holiday.type.toLowerCase()}`)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteHoliday(holiday.id)}
                    className="text-red-600 hover:text-red-700 text-sm inline-flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t("holidays.buttons.delete")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {errorMsg ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMsg}
          </div>
        ) : null}
      </main>
    </div>
  );
}
