import { createContext, useContext } from "react";

export type ReviewerRemark = {
  remark: string;
  status: "Accepted" | "Declined" | "Re-Submitted";
  timestamp: string;
};

export type ReviewerStatusEntry = {
  id: string;
  status: "Accepted" | "Declined" | "Re-Submitted";
  remark?: string;
  remarkTimestamp?: string;
  remarks?: ReviewerRemark[];
};

export type ReviewerContextType = {
  isReviewer: boolean;
  isMaker: boolean;
  isRefetching: boolean;
  reviewerStatusMap: Map<string, ReviewerStatusEntry>;
  onReviewerAccept: (questionId: string) => Promise<boolean>;
  onReviewerDecline: (questionId: string, remark: string, skipEmail?: boolean) => Promise<boolean>;
  onReviewerJustify: (questionId: string, remark: string, skipEmail?: boolean) => Promise<boolean>;
  onReviewerBulkAccept: () => Promise<boolean>;
  onRefetchInvitation: () => Promise<void>;
};

export const ReviewerContext = createContext<ReviewerContextType>({
  isReviewer: false,
  isMaker: false,
  isRefetching: false,
  reviewerStatusMap: new Map(),
  onReviewerAccept: () => Promise.resolve(false),
  onReviewerDecline: () => Promise.resolve(false),
  onReviewerJustify: () => Promise.resolve(false),
  onReviewerBulkAccept: () => Promise.resolve(false),
  onRefetchInvitation: () => Promise.resolve(),
});

export const useReviewerContext = () => useContext(ReviewerContext);
