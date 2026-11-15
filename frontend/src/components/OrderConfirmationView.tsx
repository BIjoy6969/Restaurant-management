import React, { useState, useEffect, useMemo } from 'react';
import { Order, Restaurant, BillSlipType } from '../types';
import { api } from '../services/api';
import {
  CheckCircle2,
  Clock,
  Receipt,
  ArrowLeft,
  CreditCard,
  Banknote,
  Loader2,
  AlertCircle,
  Sparkles,
  Smartphone,
  FileText,
  Flame,
  ChefHat,
  Droplets,
  Check,
  Star,
  X,
} from 'lucide-react';
import { Review } from '../types';

interface OrderConfirmationViewProps {
  order: Order;
  restaurant: Restaurant;
  onBackToMenu: () => void;
  onOrderAdditionalItems: () => void;
  onResetTableSession: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  restaurant,
  onBackToMenu,
  onOrderAdditionalItems,
  onResetTableSession,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);

  // Sync prop updates
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Real-time polling to reflect Chef "Start Cooking" and "Ready" updates instantly
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const res = await api.getOrder(order.id);
        if (isMounted && res.order) {
          setCurrentOrder(res.order);
        }
      } catch (e) {
        // quiet polling error
      }
    };

    const interval = setInterval(fetchLatest, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [order.id]);

  const isSettled = currentOrder.status === 'Completed';
  const isPreparing = currentOrder.status === 'Preparing';
  const isReady = currentOrder.status === 'Ready';
  const isDelivered = currentOrder.status === 'Delivered';
  const hasFloorItems = currentOrder.items.some((it) => it.station === 'WAITER_FLOOR');

  const [, setBillRequested] = useState(currentOrder.billRequested || isSettled);
  const [billMessage, setBillMessage] = useState<string | null>(
    isSettled
      ? `Payment processed and settled. Table ${currentOrder.tableId} is now cleared for next seating.`
      : currentOrder.billRequested
      ? 'A bill request is active for this order. Waitstaff has been notified.'
      : null
  );
  const [paymentPreference, setPaymentPreference] = useState<'CARD' | 'CASH'>('CARD');
  const [billSlipType, setBillSlipType] = useState<BillSlipType>('PHYSICAL');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isRequestingBill, setIsRequestingBill] = useState(false);
  const [billError, setBillError] = useState<string | null>(null);

  // Customer Review State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [foodRating, setFoodRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [ambianceRating, setAmbianceRating] = useState<number>(5);
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>([]);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  // Popup & Modal States
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [hasAutoOpenedFeedback, setHasAutoOpenedFeedback] = useState<boolean>(false);
  const [showThankYouModal, setShowThankYouModal] = useState<boolean>(false);

  const hasFoodItems = currentOrder.items.some(
    (it) => it.station === 'KITCHEN' || it.station === 'BAR'
  );

  const isFloorWaterServed = Boolean(
    localStorage.getItem(`breakroom_floor_served_${currentOrder.id}`) === 'true'
  );

  const isDeliveredOrSettled = (isDelivered || isSettled) && hasFoodItems;

  // Auto-open feedback modal when food is delivered
  useEffect(() => {
    if (isDeliveredOrSettled && !reviewSubmitted && !existingReview && !hasAutoOpenedFeedback) {
      setShowFeedbackModal(true);
      setHasAutoOpenedFeedback(true);
    }
  }, [isDeliveredOrSettled, reviewSubmitted, existingReview, hasAutoOpenedFeedback]);

  // Dynamically extract dishes ordered in this session
  const orderedDishes = useMemo(() => {
    return Array.from(
      new Set(currentOrder.items.map((it) => it.itemNameSnapshot?.trim()))
    ).filter(Boolean) as string[];
  }, [currentOrder.items]);

  // Professional Staff & Service Tags
  const serviceTags = [
    '⚡ Super Fast Service',
    '😊 Friendly Staff',
    '🛎️ Attentive Waiter',
    '👌 Professional Behavior',
    '🧼 Clean & Safe Handling',
  ];

  // Dining Atmosphere & Environment Tags
  const ambianceTags = [
    '✨ Cozy & Warm Atmosphere',
    '🎵 Great Music & Vibe',
    '❄️ Comfortable Seating & AC',
    '💡 Aesthetic Lighting',
    '🌿 Clean & Spotless Interior',
  ];

  useEffect(() => {
    let mounted = true;
    const checkReview = async () => {
      try {
        const res = await api.getReviewByOrder(currentOrder.id);
        if (mounted && res.review) {
          setExistingReview(res.review);
          setReviewSubmitted(true);
        }
      } catch (e) {
        // Ignore if no review yet
      }
    };
    checkReview();
    return () => {
      mounted = false;
    };
  }, [currentOrder.id]);

  const handleToggleReviewTag = (tag: string) => {
    setSelectedReviewTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingReview) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview(currentOrder.id, {
        tableId: currentOrder.tableId,
        restaurantId: restaurant.id,
        customerName: reviewerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        rating: reviewRating,
        foodRating,
        serviceRating,
        ambianceRating,
        tags: selectedReviewTags,
        comment: reviewComment.trim(),
      });
      setExistingReview(res.review);
      setReviewSubmitted(true);
      setShowFeedbackModal(false);
      setShowThankYouModal(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const currency = restaurant.currency || '$';

  // Guest-facing lifecycle stages
  const getStageIndex = () => {
    if (isSettled || currentOrder.billRequested) return 4;
    if (isDelivered) return 3;
    if (isReady) return 2;
    if (isPreparing) return 1;
    return 0; // Received
  };

  const guestStages = [
    { label: 'Order Placed', icon: Clock },
    { label: 'Chef Cooking', icon: Flame },
    { label: 'Food Ready', icon: ChefHat },
    { label: 'Served', icon: Check },
    { label: 'Bill Settle', icon: Receipt },
  ];

  const curStageIdx = getStageIndex();

  const handleRequestBill = async () => {
    if (isRequestingBill) return;

    if (billSlipType === 'DIGITAL' && !customerPhone.trim()) {
      setBillError('Please enter your mobile phone number for the digital slip.');
      return;
    }

    setIsRequestingBill(true);
    setBillError(null);

    try {
      // Customer requests bill without auto-settling (Cashier settles the payment)
      await api.requestBill(
        currentOrder.id, 
        paymentPreference, 
        false, 
        billSlipType, 
        customerPhone.trim() || undefined
      );
      setBillRequested(true);
      setBillMessage(
        billSlipType === 'DIGITAL'
          ? `Digital Bill Request Sent! Total Due: ${currency}${currentOrder.total.toFixed(2)}. An SMS receipt will be sent to ${customerPhone}. Please pay at Cashier POS.`
          : `Paper Bill Request Sent! Floor staff will deliver the printed memo to Table ${currentOrder.tableId}. Please pay via ${paymentPreference}.`
      );
    } catch (err: any) {
      setBillError(err.message || 'Failed to request bill. Please inform waitstaff.');
    } finally {
      setIsRequestingBill(false);
    }
  };

  const renderReviewForm = (_isModal: boolean = false) => (
    <form onSubmit={handleSubmitReview} className="space-y-4">
      {/* Overall Star Rating */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
          Overall Dining Experience (সামগ্রিক অভিজ্ঞতা)
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setReviewRating(star)}
              className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
              title={`${star} Star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                  star <= reviewRating
                    ? 'text-amber-500 fill-amber-500 drop-shadow-sm'
                    : 'text-stone-300 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
            {reviewRating === 5
              ? '🌟 Outstanding!'
              : reviewRating === 4
              ? '😊 Very Good'
              : reviewRating === 3
              ? '🙂 Good'
              : reviewRating === 2
              ? '😐 Fair'
              : '😞 Needs Attention'}
          </span>
        </div>
      </div>

      {/* Detailed Category Star Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
        {/* Food Taste */}
        <div>
          <span className="text-[11px] font-bold text-stone-700 block mb-1">
            🍔 Food Quality & Taste
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFoodRating(s)}
                className="p-0.5 hover:scale-110 cursor-pointer"
              >
                <Star
                  className={`w-4 h-4 ${
                    s <= foodRating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Waiter Service */}
        <div>
          <span className="text-[11px] font-bold text-stone-700 block mb-1">
            ⚡ Service & Speed
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setServiceRating(s)}
                className="p-0.5 hover:scale-110 cursor-pointer"
              >
                <Star
                  className={`w-4 h-4 ${
                    s <= serviceRating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Ambiance */}
        <div>
          <span className="text-[11px] font-bold text-stone-700 block mb-1">
            ✨ Ambiance & Vibe
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAmbianceRating(s)}
                className="p-0.5 hover:scale-110 cursor-pointer"
              >
                <Star
                  className={`w-4 h-4 ${
                    s <= ambianceRating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* What did you enjoy most? (Tap to select) */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
          What did you enjoy most? (Tap to select)
        </label>

        {/* 1. Live Ordered Dishes */}
        {orderedDishes.length > 0 && (
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80">
            <span className="text-[11px] font-bold text-amber-900 block mb-2 flex items-center gap-1.5">
              <span>🍽️ Your Ordered Dishes (আপনার খাবারসমূহ - সেরাটি সিলেক্ট করুন):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {orderedDishes.map((dishName) => {
                const isSelected = selectedReviewTags.includes(dishName);
                return (
                  <button
                    key={dishName}
                    type="button"
                    onClick={() => handleToggleReviewTag(dishName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400 font-bold'
                        : 'bg-white hover:bg-amber-100 text-stone-700 border border-amber-200/80'
                    }`}
                  >
                    <span>{dishName}</span>
                    <span className="text-[10px]">{isSelected ? '✓' : '❤️'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Staff & Waiter Service */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
          <span className="text-[11px] font-bold text-stone-800 block mb-2 flex items-center gap-1.5">
            <span>⚡ Staff & Waiter Service (স্টাফ ও সার্ভিসের মান):</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {serviceTags.map((tag) => {
              const isSelected = selectedReviewTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleReviewTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs ring-2 ring-stone-700 font-bold'
                      : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Environment & Ambiance */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
          <span className="text-[11px] font-bold text-stone-800 block mb-2 flex items-center gap-1.5">
            <span>✨ Environment & Ambiance (রেস্তোরাঁর পরিবেশ ও আবহ):</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ambianceTags.map((tag) => {
              const isSelected = selectedReviewTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleReviewTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-700 text-white shadow-xs ring-2 ring-amber-500 font-bold'
                      : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Name & Comment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="e.g. Tanvir"
            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
            Comments or Suggestions
          </label>
          <input
            type="text"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Tell us what you loved or how we can improve..."
            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmittingReview}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
      >
        {isSubmittingReview ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Star className="w-4 h-4 fill-white" />
        )}
        <span>{isSubmittingReview ? 'Submitting Review...' : 'Submit Dining Review ⭐'}</span>
      </button>
    </form>
  );

  return (
    <div className="w-full max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={isSettled ? onResetTableSession : onBackToMenu}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-semibold mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isSettled ? 'Return to Fresh Menu (Table Reset)' : 'Return to Menu'}</span>
      </button>

      {/* Live Staff Stage Simulator Bar for Localhost Testing */}
      <div className="mb-6 p-3 sm:p-4 bg-stone-900 text-white rounded-2xl shadow-xl border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-xs font-bold text-amber-300 block">Live Staff Stage Controller</span>
            <span className="text-[11px] font-mono text-stone-300">
              Current Status: <strong className="text-amber-400 uppercase">{currentOrder.status}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={async () => {
              await api.updateOrderStatus(currentOrder.id, 'Preparing');
              const res = await api.getOrder(currentOrder.id);
              if (res.order) setCurrentOrder(res.order);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentOrder.status === 'Preparing'
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 shadow-md animate-pulse'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>1. Chef: Start Cooking</span>
          </button>

          <button
            onClick={async () => {
              await api.updateOrderStatus(currentOrder.id, 'Ready');
              const res = await api.getOrder(currentOrder.id);
              if (res.order) setCurrentOrder(res.order);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentOrder.status === 'Ready'
                ? 'bg-emerald-500 text-stone-950 ring-2 ring-emerald-300 shadow-md animate-pulse'
                : 'bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-stone-700'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>2. Chef: Mark Ready</span>
          </button>

          <button
            onClick={async () => {
              await api.updateOrderStatus(currentOrder.id, 'Delivered');
              const res = await api.getOrder(currentOrder.id);
              if (res.order) setCurrentOrder(res.order);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentOrder.status === 'Delivered'
                ? 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-md'
                : 'bg-stone-800 hover:bg-stone-700 text-blue-300 border border-stone-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Waiter: Deliver</span>
          </button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 mb-3 border border-amber-500/30">
            {!hasFoodItems ? (
              <Droplets className="w-8 h-8 text-blue-400 animate-pulse" />
            ) : isPreparing ? (
              <Flame className="w-8 h-8 text-amber-400 animate-bounce" />
            ) : isReady ? (
              <ChefHat className="w-8 h-8 text-emerald-400 animate-pulse" />
            ) : isDelivered ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            {!hasFoodItems
              ? isDelivered
                ? 'Water Dispatched to Table!'
                : 'Water Request Received'
              : isPreparing
              ? 'Chef is Cooking Your Food!'
              : isReady
              ? 'Your Food is Ready!'
              : isDelivered
              ? 'Order Delivered to Table!'
              : 'Order Confirmed!'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-sm mx-auto">
            {!hasFoodItems
              ? isDelivered
                ? `Water and beverage delivered to Table ${currentOrder.tableId}. Enjoy!`
                : 'Your water request is sent directly to floor staff for immediate dispatch.'
              : isPreparing
              ? 'Our kitchen chefs are actively preparing and cooking your order.'
              : isReady
              ? 'Dishes are freshly plated! Waitstaff is on their way to serve your table.'
              : isDelivered
              ? `Dishes served to Table ${currentOrder.tableId}. Please enjoy your meal!`
              : 'Your dining ticket has been sent to our kitchen & bar stations.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {!hasFoodItems ? (
            <div className="p-4 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-blue-500/10 border-2 border-blue-400 rounded-2xl flex items-center justify-between text-blue-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Droplets className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-900">
                    Water & Refreshment Direct Dispatch
                  </h4>
                  <p className="text-xs text-stone-600">
                    {isDelivered || isSettled
                      ? 'Water Dispatched — মিনারেল ওয়াটার টেবিলে সরবরাহ সম্পন্ন হয়েছে।'
                      : 'পানি সরাসরি ফ্লোর ওয়েটার কর্তৃক দ্রুততম সময়ে টেবিলে পরিবেশন করা হচ্ছে।'}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isDelivered || isSettled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800 animate-pulse'
                }`}
              >
                {isDelivered || isSettled ? '✓ Dispatched' : '💧 Floor Waiter Serving'}
              </span>
            </div>
          ) : (
            <>
              {/* Real-time Visual Stepper */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-2 text-center">
                  Live Preparation & Service Progress
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {guestStages.map((st, sIdx) => {
                    const isPassed = sIdx < curStageIdx;
                    const isCurrent = sIdx === curStageIdx;
                    const IconComponent = st.icon;

                    return (
                      <div
                        key={sIdx}
                        className={`p-2 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                          isCurrent
                            ? sIdx === 1
                              ? 'bg-amber-600 text-white shadow-md animate-pulse ring-2 ring-amber-400/50'
                              : sIdx === 2
                              ? 'bg-emerald-600 text-white shadow-md animate-pulse ring-2 ring-emerald-400/50'
                              : 'bg-stone-900 text-white shadow-md'
                            : isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200/60 text-stone-400'
                        }`}
                      >
                        <IconComponent className={`w-3.5 h-3.5 ${isCurrent && sIdx === 1 ? 'animate-bounce' : ''}`} />
                        <span className="text-[9px] leading-tight line-clamp-1">{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Live Status Dynamic Banner */}
              {isPreparing && (
                <div className="p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/15 border-2 border-amber-500/50 rounded-2xl flex items-center justify-between text-amber-950 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md">
                      <Flame className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-stone-900">
                        🔥 Cooking in Progress in Kitchen
                      </h4>
                      <p className="text-xs text-stone-600">
                        Your chef is working on your meal right now.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-600 text-white shadow-xs">
                    Active Prep
                  </span>
                </div>
              )}

              {isReady && (
                <div className="p-4 bg-gradient-to-r from-emerald-500/15 via-teal-500/20 to-emerald-500/15 border-2 border-emerald-500/60 rounded-2xl flex items-center justify-between text-emerald-950 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md">
                      <Sparkles className="w-5 h-5 animate-spin" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-emerald-950">
                        🍽️ Food is Plated & Ready!
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Floor waitstaff has been dispatched to bring dishes to Table {currentOrder.tableId}.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                    Ready for Server
                  </span>
                </div>
              )}
            </>
          )}

          {/* Direct Floor Service Alert for Water / Drinks */}
          {hasFloorItems && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all ${
              isFloorWaterServed
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : 'bg-blue-50/80 border-blue-200 text-blue-900'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-xl text-white ${
                  isFloorWaterServed ? 'bg-emerald-600' : 'bg-blue-600'
                }`}>
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">
                    {isFloorWaterServed
                      ? 'Water Dispatched — পানি টেবিলে দেওয়া হয়েছে'
                      : 'Water & Refreshment Direct Dispatch:'}
                  </span>
                  <span className={`text-[11px] ${isFloorWaterServed ? 'text-emerald-800' : 'text-blue-800'}`}>
                    {isFloorWaterServed
                      ? 'মিনারেল ওয়াটার টেবিলে সরবরাহ সম্পন্ন হয়েছে। মূল খাবার কিচেনে প্রস্তুত হচ্ছে।'
                      : 'পানি সরাসরি ফ্লোর ওয়েটার কর্তৃক দ্রুততম সময়ে টেবিলে পরিবেশন করা হচ্ছে (রান্না ছাড়াই)।'}
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                isFloorWaterServed
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-100 text-blue-800 animate-pulse'
              }`}>
                {isFloorWaterServed ? '✓ Water Served' : '💧 Waiter Floor Service'}
              </span>
            </div>
          )}

          {/* Order ID & Table Badge */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs sm:text-sm">
            <div>
              <span className="text-stone-400 block text-[11px] uppercase font-bold tracking-wider">
                Order Reference
              </span>
              <span className="font-mono font-bold text-stone-900">{currentOrder.id}</span>
            </div>
            <div className="text-right">
              <span className="text-stone-400 block text-[11px] uppercase font-bold tracking-wider">
                Seating
              </span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Table {currentOrder.tableId}
              </span>
            </div>
          </div>

          {/* Status Explanation Note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Order Status: {currentOrder.status}</span>
              <span>
                Your ticket has been recorded in our database. Kitchen, floor waiters, and cashier consoles are actively tracking your session.
              </span>
            </div>
          </div>

          {/* Itemized Snapshot Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-700" />
                <span>Running Table Bill & Order History</span>
              </h4>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {currentOrder.items.reduce((s, it) => s + it.quantity, 0)} Items
              </span>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">
                        <span className="text-amber-700 font-bold mr-1.5">{item.quantity}x</span>
                        {item.itemNameSnapshot}
                      </span>
                      {item.round && item.round > 1 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-900 rounded">
                          Round {item.round}
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 text-[10px] font-medium bg-stone-100 text-stone-600 rounded">
                        {item.station || 'KITCHEN'}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {currency}{item.unitPriceSnapshot.toFixed(2)} each
                      {item.specialInstructions && (
                        <span className="ml-2 italic text-stone-500">
                          (Note: {item.specialInstructions})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-serif font-bold text-stone-900">
                    {currency}{item.lineTotal.toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Totals */}
              <div className="p-4 bg-stone-50 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">{currency}{currentOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({((currentOrder.tax / (currentOrder.subtotal || 1)) * 100).toFixed(0)}%)</span>
                  <span className="font-medium text-stone-900">{currency}{currentOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Grand Total (Running Bill)</span>
                  <span className="font-serif text-base text-amber-800">{currency}{currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CUSTOMER REVIEW & FEEDBACK SECTION (Visible only when food is Served / Delivered) ================= */}
          {isDeliveredOrSettled && (
            <div className="pt-4 border-t border-stone-200">
              {reviewSubmitted || existingReview ? (
                <div className="p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400 rounded-3xl shadow-sm animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-stone-900">
                          Thank You for Dining With Us!
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Your review has been shared with The Break Room team.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Review Logged
                    </span>
                  </div>

                  <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= (existingReview?.rating || reviewRating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-stone-900 ml-2">
                        {(existingReview?.rating || reviewRating)}.0 / 5.0
                      </span>
                    </div>
                    {existingReview?.tags && existingReview.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {existingReview.tags.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {(existingReview?.comment || reviewComment) && (
                    <p className="text-xs text-stone-700 italic bg-white/60 p-3 rounded-xl border border-stone-200/60">
                      "{existingReview?.comment || reviewComment}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200 shadow-md animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Guest Feedback</span>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-stone-900">
                        How was your meal at The Break Room?
                      </h4>
                      <p className="text-xs text-stone-500">
                        Dishes served! Share your dining experience with us.
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-semibold text-stone-400 block uppercase">Table Session</span>
                      <span className="text-xs font-bold text-amber-800">Table {currentOrder.tableId}</span>
                    </div>
                  </div>

                  {renderReviewForm(false)}
                </div>
              )}
            </div>
          )}

          {/* Request Bill / Settlement Section */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="font-serif text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-700" />
              <span>{isSettled ? 'Table Bill Settled' : 'Ready to Settle? Request Your Bill'}</span>
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              {isSettled
                ? `The final bill has been paid. Table ${currentOrder.tableId} is now cleared for the next diners.`
                : `Select your preferred slip format and payment method to notify staff.`}
            </p>

            {billError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{billError}</span>
              </div>
            )}

            {isSettled ? (
              <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm block mb-1">
                      Payment Confirmed & Table {currentOrder.tableId} Cleared!
                    </span>
                    <p className="text-xs leading-relaxed text-emerald-800">
                      {billMessage || `Payment of ${currency}${currentOrder.total.toFixed(2)} recorded. The table is now available for new orders.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onResetTableSession}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start New Order on Table {currentOrder.tableId} (Table Cleared)</span>
                </button>
              </div>
            ) : billMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block mb-0.5">
                    Bill Request Active
                  </span>
                  <p className="text-xs leading-relaxed">{billMessage}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                {/* Bill Slip Preference: Digital vs Physical */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2">
                    Bill Receipt Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBillSlipType('PHYSICAL')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        billSlipType === 'PHYSICAL'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Physical Paper Memo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillSlipType('DIGITAL')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        billSlipType === 'DIGITAL'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Digital Pay-Slip (SMS)</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Phone Input for Digital Slip */}
                {billSlipType === 'DIGITAL' && (
                  <div className="animate-fadeIn">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Customer Phone Number (Stored for SMS Receipt)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+880 17XX XXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Payment Method Preference */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentPreference('CARD')}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        paymentPreference === 'CARD'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1" />
                      <span>Credit Card / Digital</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentPreference('CASH')}
                      className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        paymentPreference === 'CASH'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                      }`}
                    >
                      <Banknote className="w-4 h-4 mb-1" />
                      <span>Cash at Counter / Table</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestBill}
                  disabled={isRequestingBill}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isRequestingBill ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Notifying Cashier & Waitstaff...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4 text-amber-400" />
                      <span>Request Payment (Table {currentOrder.tableId})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-stone-500">
            {isSettled
              ? `Table ${currentOrder.tableId} session concluded. Ready for next seating.`
              : `Thank you for dining with ${restaurant.name}!`}
          </p>
          {isSettled ? (
            <button
              onClick={onResetTableSession}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start New Order on Table {currentOrder.tableId}</span>
            </button>
          ) : (
            <button
              onClick={onOrderAdditionalItems}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Order Additional Items</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Feedback Button (Active when food served & review not yet submitted) */}
      {isDeliveredOrSettled && !reviewSubmitted && !existingReview && !showFeedbackModal && (
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-amber-300 animate-bounce"
          title="খাবার কেমন লাগলো? আপনার ফিডব্যাক দিন"
        >
          <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
          <span className="text-xs sm:text-sm font-serif">ফিডব্যাক দিন (Review)</span>
        </button>
      )}

      {/* Guest Feedback Popup Modal */}
      {showFeedbackModal && !reviewSubmitted && !existingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-stone-200 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    খাবার কেমন লাগলো? রিভিউ দিন
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Dishes served to Table {currentOrder.tableId} • Share your feedback!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                title="পরে দিন (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderReviewForm(true)}
          </div>
        </div>
      )}

      {/* Thank You Celebration Popup Modal with Punchline */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-400 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block mb-1">
                Review Recorded • The Break Room
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                ধন্যবাদ! আপনার রিভিউ জমা হয়েছে
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Thank you for dining with us at The Break Room, Table {currentOrder.tableId}!
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-200 text-stone-800 space-y-1">
              <p className="font-serif italic text-base font-bold text-amber-900">
                "Take a Break, Crave More! — আবার আসবেন!"
              </p>
              <p className="text-xs text-stone-600">
                আপনার চমৎকার সময় নিশ্চিত করতে পেরে আমরা আনন্দিত। দ্য ব্রেক রুমে আপনাকে আবারও স্বাগতম, খুব শীঘ্রই আবার দেখা হচ্ছে!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowThankYouModal(false)}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              ঠিক আছে (Continue)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
