import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { WardRecord, DrainageCategory, ReportItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatusTimeline } from '../components/common/StatusTimeline';

interface CitizenReportPageProps {
  onBackToHome: () => void;
}

export const CitizenReportPage: React.FC<CitizenReportPageProps> = ({ onBackToHome }) => {
  // Step tracker: 1: Photo, 2: Location & Ward, 3: Details & Submit, 4: Ticket & Track
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBmE6uzfa2iABqoGZ4ZFDwlsfd4enFDV0980HCqMoHoPnlmEnbZhm1yny0111R_UojNvI2L7xYZNQmOO3gJe_0VjuRohhwSinGmK4jOTJBWAkXj0XklZ-xtXe1ABk02uLRx4xx0r26tPDYH_t-G68RfCljjj8XzWMJzDfLPQAiWm_zGVi1W2SCjG0ENGC5mowK4bR0wOOlbrHuOMD0yn6eYssgHbx3UMTA-Z3i9JdRZykYPvvRO8Q-FQg'
  );
  const [latitude, setLatitude] = useState<number>(9.9674);
  const [longitude, setLongitude] = useState<number>(76.3182);
  const [landmark, setLandmark] = useState<string>('Near Crossroad Junction North');
  const [category, setCategory] = useState<DrainageCategory>('STORM_DRAIN');
  const [description, setDescription] = useState<string>('Heavy plastic waste and silt buildup blocking rainwater entry.');
  const [wards, setWards] = useState<WardRecord[]>([]);
  const [selectedWardNumber, setSelectedWardNumber] = useState<string>('14');

  // Submission & Result state
  const [submitting, setSubmitting] = useState(false);
  const [createdReport, setCreatedReport] = useState<ReportItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getWards().then((w) => {
      setWards(w);
    }).catch(() => {
      // Fallback wards if API offline
      setWards([
        { wardNumber: '03', wardName: 'Marine Central', division: 'Division 1', leadOfficer: 'Officer R. DSilva' },
        { wardNumber: '08', wardName: 'Kaloor North', division: 'Division 2', leadOfficer: 'Supervisor Standby' },
        { wardNumber: '11', wardName: 'Railway Sector', division: 'Division 3', leadOfficer: 'Officer V. Chacko' },
        { wardNumber: '14', wardName: 'Vyttila Central', division: 'Division 4', leadOfficer: 'Insp. K. Menon' },
        { wardNumber: '21', wardName: 'Coastal Reach', division: 'Division 5', leadOfficer: 'Officer P. Das' },
      ]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const activeWard = wards.find((w) => w.wardNumber === selectedWardNumber) || {
      wardNumber: selectedWardNumber,
      wardName: `Ward ${selectedWardNumber}`,
      division: 'Division 1',
      leadOfficer: 'Unassigned',
    };

    try {
      const result = await api.createReport({
        category,
        wardNumber: activeWard.wardNumber,
        wardName: activeWard.wardName,
        latitude,
        longitude,
        landmark,
        description,
        photoUrl,
      });
      setCreatedReport(result);
      setStep(4); // Advance to Ticket & Track
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[960px] mx-auto px-margin md:px-gutter py-space-xl">
      {/* Workflow Breadcrumb Stepper */}
      <div className="mb-space-lg">
        <div className="flex items-center justify-between mb-space-xs">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1 font-label-md text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </button>
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Step {step} of 4: {step === 1 && 'Photo Evidence'}
            {step === 2 && 'Location & Ward'}
            {step === 3 && 'Incident Details'}
            {step === 4 && 'Ticket & Track'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className={`h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-surface-container'}`} />
          <div className={`h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-surface-container'}`} />
          <div className={`h-2 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-surface-container'}`} />
          <div className={`h-2 rounded-full ${step >= 4 ? 'bg-secondary' : 'bg-surface-container'}`} />
        </div>
      </div>

      {/* STEP 1: PHOTO */}
      {step === 1 && (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div>
            <span className="text-secondary font-label-sm uppercase tracking-wider font-semibold">Step 01 • Visual Evidence</span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold mt-1">Upload Blockage Photo</h2>
            <p className="font-body-md text-on-surface-variant">
              Take or select a clear image showing the clogged drain, canal grate, or overflowing culvert.
            </p>
          </div>

          <div className="relative w-full h-72 rounded-xl overflow-hidden bg-surface-container flex items-center justify-center border-2 border-dashed border-outline-variant">
            {photoUrl ? (
              <img src={photoUrl} alt="Drainage blockage evidence" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] text-outline">photo_camera</span>
                <span className="font-label-md">No photo attached</span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setPhotoUrl(
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBmE6uzfa2iABqoGZ4ZFDwlsfd4enFDV0980HCqMoHoPnlmEnbZhm1yny0111R_UojNvI2L7xYZNQmOO3gJe_0VjuRohhwSinGmK4jOTJBWAkXj0XklZ-xtXe1ABk02uLRx4xx0r26tPDYH_t-G68RfCljjj8XzWMJzDfLPQAiWm_zGVi1W2SCjG0ENGC5mowK4bR0wOOlbrHuOMD0yn6eYssgHbx3UMTA-Z3i9JdRZykYPvvRO8Q-FQg'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur font-label-sm text-primary shadow-sm hover:bg-surface-container-lowest"
              >
                Sample Image A
              </button>
              <button
                type="button"
                onClick={() =>
                  setPhotoUrl(
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCF5HknzmwPu0HiDkUfsKk0keUNW_PxZkYjvkJjlUy3mZY86fVwzMJX8dI2wtKNXoOTOKOVsXXufyS1HSQPQof3lgkRb3uPcd5cQSd3tU8J1dg7A34XUdszJw1to9cO6A3M4PWKoqSg5NtaW60guZdsGluFesP5aHSTQ32IJhkoJYGxQjBAq6Hk3rJIy7RQ5-xRBA-ETwjwzSaWVBPXui6eaDFUbMMp-hahqkAAU75zbrsPx6SQkUI1OA'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur font-label-sm text-primary shadow-sm hover:bg-surface-container-lowest"
              >
                Sample Image B
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-space-xs">
            <button
              onClick={() => setStep(2)}
              className="px-space-lg py-space-sm rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors flex items-center gap-1.5"
            >
              Continue to Location
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION & WARD */}
      {step === 2 && (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div>
            <span className="text-secondary font-label-sm uppercase tracking-wider font-semibold">Step 02 • Geospatial Jurisdiction</span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold mt-1">Confirm Location & Ward</h2>
            <p className="font-body-md text-on-surface-variant">
              Confirm GPS coordinates and the responsible municipal ward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-on-surface-variant uppercase font-semibold">
                Municipal Ward
              </label>
              <select
                value={selectedWardNumber}
                onChange={(e) => setSelectedWardNumber(e.target.value)}
                className="w-full h-11 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:bg-surface focus:outline-none"
              >
                {wards.map((w) => (
                  <option key={w.wardNumber} value={w.wardNumber}>
                    Ward {w.wardNumber} — {w.wardName} ({w.division})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-on-surface-variant uppercase font-semibold">
                Landmark / Street Address
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Market Junction North"
                className="w-full h-11 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:bg-surface focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-on-surface-variant uppercase font-semibold">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-on-surface-variant uppercase font-semibold">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container"
              />
            </div>
          </div>

          <div className="flex justify-between pt-space-xs">
            <button
              onClick={() => setStep(1)}
              className="px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-space-lg py-space-sm rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors flex items-center gap-1.5"
            >
              Continue to Details
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAILS & SUBMIT */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div>
            <span className="text-secondary font-label-sm uppercase tracking-wider font-semibold">Step 03 • Blockage Details</span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold mt-1">Describe the Blockage</h2>
            <p className="font-body-md text-on-surface-variant">
              Provide category and description for the municipal maintenance dispatch team.
            </p>
          </div>

          {errorMsg && (
            <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-on-surface-variant uppercase font-semibold">
              Waterway / Drainage Category
            </label>
            <div className="grid grid-cols-3 gap-space-sm">
              {(['STORM_DRAIN', 'CANAL', 'CULVERT'] as DrainageCategory[]).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-lg font-label-md border text-center transition-colors ${
                    category === cat
                      ? 'border-primary bg-primary text-on-primary font-semibold'
                      : 'border-surface-container-high bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {cat === 'STORM_DRAIN' && 'Storm Drain'}
                  {cat === 'CANAL' && 'Canal'}
                  {cat === 'CULVERT' && 'Culvert'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-on-surface-variant uppercase font-semibold">
              Observation Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the extent of the clog, visible trash, overflow onto footpaths, etc."
              className="w-full p-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:bg-surface focus:outline-none"
              required
            />
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-xs text-on-surface-variant font-body-sm">
            <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
            <span>Zero personal information required. Only infrastructure coordinates are saved.</span>
          </div>

          <div className="flex justify-between pt-space-xs">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-space-xl py-space-sm rounded-lg bg-secondary text-on-secondary font-label-md font-semibold hover:bg-on-secondary-container transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: TICKET & TRACK */}
      {step === 4 && createdReport && (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-lg">
          <div className="p-space-md rounded-xl bg-secondary-container/40 border border-secondary-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <div>
                <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
                  Report Successfully Registered
                </span>
                <h2 className="font-headline-md text-headline-md font-bold text-primary">
                  Ticket #{createdReport.ticketId}
                </h2>
                <p className="font-body-sm text-on-surface-variant">
                  Ward {createdReport.ward.wardNumber} ({createdReport.ward.wardName}) Response Queue
                </p>
              </div>
            </div>
            <StatusBadge status={createdReport.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Left: Summary */}
            <div className="lg:col-span-6 flex flex-col gap-space-md">
              <div className="relative h-48 rounded-lg overflow-hidden bg-surface-container border border-surface-container">
                <img src={createdReport.photoUrl} alt="Reported clog" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-primary/90 text-on-primary font-label-sm backdrop-blur">
                  Citizen Upload
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1 text-label-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Landmark:</span>
                  <span className="font-semibold text-on-surface">{createdReport.location.landmark}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Category:</span>
                  <span className="font-semibold text-on-surface">{createdReport.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Coordinates:</span>
                  <span className="font-mono text-on-surface">
                    {createdReport.location.latitude.toFixed(4)}, {createdReport.location.longitude.toFixed(4)}
                  </span>
                </div>
                <p className="text-on-surface-variant font-body-sm italic mt-1 bg-surface-container/60 p-2 rounded">
                  "{createdReport.description}"
                </p>
              </div>
            </div>

            {/* Right: Live Tracking Timeline */}
            <div className="lg:col-span-6 flex flex-col gap-space-md">
              <h3 className="font-headline-sm text-primary font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">timeline</span>
                Live Ticket Status
              </h3>
              <StatusTimeline report={createdReport} />
            </div>
          </div>

          <div className="flex justify-between border-t border-surface-container pt-space-md">
            <button
              onClick={() => {
                setStep(1);
                setCreatedReport(null);
              }}
              className="px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
            >
              Report Another Clog
            </button>
            <button
              onClick={onBackToHome}
              className="px-space-lg py-space-sm rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors"
            >
              Done & Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
