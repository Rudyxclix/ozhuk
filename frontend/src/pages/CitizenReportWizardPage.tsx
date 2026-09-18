import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { WardRecord, DrainageCategory, SeverityLevel, ReportItem } from '../types';
import { ImageUploader } from '../components/common/ImageUploader';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const CitizenReportWizardPage: React.FC = () => {
  const navigate = useNavigate();

  // 4-step wizard
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number>(9.9674);
  const [longitude, setLongitude] = useState<number>(76.3182);
  const [landmark, setLandmark] = useState<string>('Near 9th Cross, Market Junction');
  const [category, setCategory] = useState<DrainageCategory>('STORM_DRAIN');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [description, setDescription] = useState<string>(
    'Plastic bottles, silt, and fallen debris blocking water intake. Backing up onto the footpath.'
  );

  // Wards & Automated Ward Derivation
  const [wards, setWards] = useState<WardRecord[]>([]);
  const [detectedWard, setDetectedWard] = useState<WardRecord>({
    wardNumber: '14',
    wardName: 'Vyttila Central',
    division: 'Division 4',
    leadOfficer: 'Standby Officer',
  });

  // Validation errors
  const [stepErrors, setStepErrors] = useState<{ [key: string]: string }>({});

  // Submission & Result state
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<ReportItem | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    api.getWards().then((data) => {
      setWards(data);
      if (data.length > 0) {
        const defaultWard = data.find((w) => w.wardNumber === '14') || data[0];
        setDetectedWard(defaultWard);
      }
    }).catch(console.error);
  }, []);

  // Update image preview URL when file changes
  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPhotoPreviewUrl(url);
      setStepErrors((prev) => ({ ...prev, photo: '' }));
      return () => URL.revokeObjectURL(url);
    } else {
      setPhotoPreviewUrl(null);
    }
  }, [photoFile]);

  // Automatic ward derivation based on coordinates
  const updateLocationAndWard = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setStepErrors((prev) => ({ ...prev, location: '' }));

    if (wards.length === 0) return;

    let wardNum = '14';
    if (lat > 9.98) wardNum = '08';
    else if (lat > 9.965) wardNum = '14';
    else if (lat > 9.955) wardNum = '03';
    else wardNum = '21';

    const matched = wards.find((w) => w.wardNumber === wardNum) || wards[0];
    setDetectedWard(matched);
  };

  const handleGPSAutoDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocationAndWard(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          updateLocationAndWard(9.9674, 76.3182);
        },
        { timeout: 5000 }
      );
    } else {
      updateLocationAndWard(9.9674, 76.3182);
    }
  };

  // Step Validation Checkers
  const validateStep1 = () => {
    if (!photoFile) {
      setStepErrors({ photo: 'Please capture or attach a photo of the blockage before proceeding.' });
      return false;
    }
    setStepErrors({});
    return true;
  };

  const validateStep2 = () => {
    const errors: { [key: string]: string } = {};
    if (isNaN(latitude) || latitude === 0 || isNaN(longitude) || longitude === 0) {
      errors.coords = 'Valid GPS coordinates are required.';
    }
    if (!landmark.trim()) {
      errors.landmark = 'Please provide a street address or identifiable landmark.';
    }
    if (!detectedWard || !detectedWard.wardNumber) {
      errors.ward = 'Municipal ward must be identified.';
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: { [key: string]: string } = {};
    if (!category) {
      errors.category = 'Please select a drainage category.';
    }
    if (!severity) {
      errors.severity = 'Please select a severity level.';
    }
    if (!description.trim()) {
      errors.description = 'Please enter observable details about the blockage.';
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) setStep(3);
  };

  const handleNextFromStep3 = () => {
    if (validateStep3()) setStep(4);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      let uploadedPhotoUrl: string | undefined = undefined;
      let uploadedPhotoFileName: string | undefined = undefined;

      // 1. If citizen provided a photo, upload directly to MongoDB GridFS first
      if (photoFile) {
        try {
          const uploadRes = await api.uploadPhoto(photoFile);
          uploadedPhotoUrl = uploadRes.url;
          uploadedPhotoFileName = uploadRes.fileName;
        } catch (uploadErr: unknown) {
          const uErr = uploadErr as Error;
          setApiError(`Failed to upload photo: ${uErr.message || 'Storage error'}. Please retry or choose another image.`);
          setSubmitting(false);
          return;
        }
      }

      // 2. Create the report referencing the persistent photo URL
      const newReport = await api.createReport({
        category,
        severity,
        wardNumber: detectedWard.wardNumber,
        wardName: detectedWard.wardName,
        latitude,
        longitude,
        landmark: landmark.trim(),
        description: description.trim(),
        photoUrl: uploadedPhotoUrl,
        photoFileName: uploadedPhotoFileName || (photoFile ? photoFile.name : undefined),
      });

      setSubmittedReport(newReport);
    } catch (err: unknown) {
      const error = err as Error;
      setApiError(error.message || 'Failed to submit report. Please verify connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION STATE
  if (submittedReport) {
    return (
      <div className="max-w-[720px] mx-auto px-margin py-space-xl">
        <div className="rounded-xl bg-surface-container-lowest p-space-xl shadow-md border border-surface-container flex flex-col items-center text-center gap-space-md">
          <div className="w-16 h-16 rounded-full bg-secondary-container text-secondary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-secondary uppercase font-bold tracking-wider">
              Report Successfully Created
            </span>
            <h1 className="font-headline-lg text-primary font-bold">
              Ticket #{submittedReport.ticketId}
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-md">
              Your report has been queued for Ward {submittedReport.ward.wardNumber} ({submittedReport.ward.wardName}) drainage triage.
            </p>
          </div>

          <div className="w-full p-space-md rounded-lg bg-surface-container-low border border-surface-container text-left flex flex-col gap-2 text-body-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Ticket Reference:</span>
              <span className="font-mono font-bold text-primary">{submittedReport.ticketId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Current Status:</span>
              <span className="font-semibold text-secondary uppercase tracking-wider text-[12px] bg-secondary-container/60 px-2 py-0.5 rounded">
                {submittedReport.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Category & Severity:</span>
              <span className="font-semibold text-on-surface">
                {submittedReport.category} • {submittedReport.severity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Location:</span>
              <span className="font-semibold text-on-surface">{submittedReport.location.landmark}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Assigned Ward:</span>
              <span className="font-semibold text-on-surface">
                Ward {submittedReport.ward.wardNumber} ({submittedReport.ward.wardName})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Timestamp:</span>
              <span className="font-mono text-on-surface">
                {new Date(submittedReport.reportedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-space-sm w-full pt-space-sm">
            <button
              onClick={() => navigate(`/track/${submittedReport.ticketId}`)}
              className="flex-1 h-11 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">track_changes</span>
              Track This Ticket
            </button>
            <button
              onClick={() => {
                setSubmittedReport(null);
                setPhotoFile(null);
                setStep(1);
              }}
              className="flex-1 h-11 rounded-lg bg-surface-container text-on-surface font-label-md font-semibold hover:bg-surface-container-high transition-colors"
            >
              Report Another Clog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-margin md:px-gutter py-space-xl">
      {/* Wizard Stepper Progress Bar */}
      <div className="mb-space-lg">
        <div className="flex items-center justify-between mb-space-xs">
          <Link
            to="/"
            className="flex items-center gap-1 font-label-md text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Step {step} of 4: {step === 1 && 'Photo Evidence'}
            {step === 2 && 'Location & Ward'}
            {step === 3 && 'Issue Details'}
            {step === 4 && 'Review & Submit'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className={`h-2 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-surface-container'}`} />
          <div className={`h-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-surface-container'}`} />
          <div className={`h-2 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-surface-container'}`} />
          <div className={`h-2 rounded-full transition-colors ${step >= 4 ? 'bg-secondary' : 'bg-surface-container'}`} />
        </div>
      </div>

      {apiError && (
        <div className="mb-space-md p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm flex items-center justify-between">
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* STEP 1: PHOTO */}
      {step === 1 && (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div>
            <span className="text-secondary font-label-sm uppercase tracking-wider font-semibold">
              Step 01 • Evidence
            </span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold mt-0.5">
              Upload Blockage Photo
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Provide photographic proof showing the clogged drain grate, canal blockage, or backed-up stormwater runoff.
            </p>
          </div>

          <ImageUploader
            file={photoFile}
            onFileChange={(f) => setPhotoFile(f)}
            required
            description="Use your device camera or attach an image file (JPEG, PNG, WebP up to 10MB)."
          />

          {stepErrors.photo && (
            <div className="p-space-xs px-space-sm rounded-lg bg-error-container text-on-error-container font-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>{stepErrors.photo}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-space-xs border-t border-surface-container-low">
            <span className="text-label-sm text-outline">
              {photoFile ? 'Photo attached' : 'Photo required to proceed'}
            </span>
            <button
              type="button"
              disabled={!photoFile}
              onClick={handleNextFromStep1}
              className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              Continue to Location
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION & AUTOMATIC WARD IDENTIFICATION */}
      {step === 2 && (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div>
            <span className="text-secondary font-label-sm uppercase tracking-wider font-semibold">
              Step 02 • Spatial Routing
            </span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold mt-0.5">
              Location & Ward Identification
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Coordinates locate the blockage and automatically route the report to the responsible ward division.
            </p>
          </div>

          {/* Automatic Ward Card */}
          <div className="p-space-md rounded-xl bg-secondary-container/30 border border-secondary-container flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">domain</span>
              </div>
              <div>
                <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
                  Automatically Identified Ward
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                  Ward {detectedWard.wardNumber} — {detectedWard.wardName}
                </h3>
                <span className="font-body-sm text-[12px] text-on-surface-variant">
                  {detectedWard.division}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm font-semibold">
              Auto-Detected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold uppercase text-on-surface-variant flex items-center justify-between">
                <span>Landmark / Street Address</span>
                <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => {
                  setLandmark(e.target.value);
                  setStepErrors((prev) => ({ ...prev, landmark: '' }));
                }}
                placeholder="e.g. Near 9th Cross, Market Junction"
                className="h-11 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:bg-surface focus:outline-none"
                required
              />
              {stepErrors.landmark && (
                <span className="text-error font-body-sm text-[12px]">{stepErrors.landmark}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold uppercase text-on-surface-variant">
                Select / Override Ward
              </label>
              <select
                value={detectedWard.wardNumber}
                onChange={(e) => {
                  const w = wards.find((item) => item.wardNumber === e.target.value);
                  if (w) setDetectedWard(w);
                }}
                className="h-11 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:bg-surface focus:outline-none cursor-pointer"
              >
                {wards.map((w) => (
                  <option key={w.wardNumber} value={w.wardNumber}>
                    Ward {w.wardNumber} — {w.wardName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm items-end">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold uppercase text-on-surface-variant">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => updateLocationAndWard(parseFloat(e.target.value) || 0, longitude)}
                className="h-10 px-2 rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container font-mono text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm font-semibold uppercase text-on-surface-variant">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => updateLocationAndWard(latitude, parseFloat(e.target.value) || 0)}
                className="h-10 px-2 rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container font-mono text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleGPSAutoDetect}
              className="h-10 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-semibold flex items-center justify-center gap-1 transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">my_location</span>
              Auto GPS Detect
            </button>
          </div>

          {stepErrors.coords && (
            <div className="text-error font-body-sm text-[12px]">{stepErrors.coords}</div>
          )}

          <div className="flex justify-between items-center pt-space-xs border-t border-surface-container-low">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextFromStep2}
              className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors flex items-center gap-1"
            >
              Continue to Details
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ISSUE DETAILS */}
      {step === 3 && (
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div>
            <span className="text-secondary font-label-sm uppercase tracking-wider font-semibold">
              Step 03 • Issue Details
            </span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold mt-0.5">
              Describe the Blockage
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Specify the waterway type, obstruction severity, and field description.
            </p>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm font-semibold uppercase text-on-surface-variant">
              Drainage Category
            </label>
            <div className="grid grid-cols-3 gap-space-sm">
              {(['STORM_DRAIN', 'CANAL', 'CULVERT'] as DrainageCategory[]).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`h-11 rounded-lg font-label-md font-semibold transition-colors border ${
                    category === cat
                      ? 'border-primary bg-primary text-on-primary shadow-sm'
                      : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {cat === 'STORM_DRAIN' && 'Storm Drain'}
                  {cat === 'CANAL' && 'Canal'}
                  {cat === 'CULVERT' && 'Culvert'}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Selector */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm font-semibold uppercase text-on-surface-variant">
              Severity Level
            </label>
            <div className="grid grid-cols-4 gap-space-xs">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as SeverityLevel[]).map((sev) => (
                <button
                  type="button"
                  key={sev}
                  onClick={() => setSeverity(sev)}
                  className={`py-2 px-1 rounded-lg font-label-sm uppercase font-bold transition-colors border text-center ${
                    severity === sev
                      ? sev === 'CRITICAL'
                        ? 'bg-error text-on-error border-error shadow-sm'
                        : sev === 'HIGH'
                        ? 'bg-error-container text-on-error-container border-error/40 font-bold'
                        : 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm font-semibold uppercase text-on-surface-variant flex items-center justify-between">
              <span>Observation Notes</span>
              <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setStepErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Describe the nature of the blockage (e.g. plastic waste, silt, broken grate, overflowing onto walkway)..."
              className="w-full p-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:bg-surface focus:outline-none"
              required
            />
            {stepErrors.description && (
              <span className="text-error font-body-sm text-[12px]">{stepErrors.description}</span>
            )}
          </div>

          <div className="flex justify-between items-center pt-space-xs border-t border-surface-container-low">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextFromStep3}
              className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors flex items-center gap-1"
            >
              Review & Confirm
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 4 && (
        <form onSubmit={handleFinalSubmit} className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div>
            <span className="text-secondary font-label-sm uppercase tracking-wider font-semibold">
              Step 04 • Verification
            </span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold mt-0.5">
              Review & Submit Report
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Confirm your report details before submitting to the municipal response queue.
            </p>
          </div>

          {/* Review Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md p-space-md rounded-xl bg-surface-container-low border border-surface-container">
            {photoPreviewUrl && (
              <div className="md:col-span-4 h-40 rounded-lg overflow-hidden border border-surface-container bg-surface-container">
                <img
                  src={photoPreviewUrl}
                  alt="Attached evidence preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`flex flex-col gap-1.5 ${photoPreviewUrl ? 'md:col-span-8' : 'md:col-span-12'}`}>
              <div className="flex items-center justify-between">
                <span className="font-label-lg font-bold text-primary">
                  {category} Blockage
                </span>
                <SeverityBadge severity={severity} />
              </div>
              <div className="text-body-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">Jurisdiction: </span>
                Ward {detectedWard.wardNumber} ({detectedWard.wardName})
              </div>
              <div className="text-body-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">Location: </span>
                {landmark} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
              </div>
              <p className="text-body-sm text-on-surface italic mt-1 bg-surface-container/60 p-2 rounded">
                "{description}"
              </p>
            </div>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-xs text-on-surface-variant font-body-sm">
            <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
            <span>Civic report will be logged with initial status REPORTED. No personal tracking.</span>
          </div>

          <div className="flex justify-between items-center pt-space-xs border-t border-surface-container-low">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStep(3)}
              className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-space-xl py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md font-semibold hover:bg-on-secondary-container transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-on-secondary border-t-transparent animate-spin"></span>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Official Report</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
