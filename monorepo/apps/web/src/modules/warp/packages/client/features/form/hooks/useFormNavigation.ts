import { FormMode } from '@/modules/warp/packages/shared/constants/app.constants';
import { useCallback } from 'react';
import { useGroupWizardStore } from '../group-wizard.store';
import { useWarningMessageStore } from '../store';

export const useFormNavigation = (
  activeTab: string,
  invitationId: string,
  upsertQuestionAnswer: (formFieldId: string) => Promise<boolean>,
  setLoading: (loading: boolean) => void,
  UpdateValidationWarningLogsMutation: any,
  isFirst: boolean,
  isLast: boolean,
  postParentMessage: (message: string) => void,
  raraAlertPopup: (message: string, direction: string) => string,
  warpWarningmessage: (message: string, direction: string) => string,
  query: { mode?: string }
) => {
  const removeWarning = useWarningMessageStore(store => store.removeWarningRuleFields);
  const nextHandler = useGroupWizardStore(store => store.nextHandler);
  const prevHandler = useGroupWizardStore(store => store.prevHandler);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const handleWarningRemoval = useCallback(async (warningData: any[]) => {
    if (warningData.length > 0) {
      const dataToUpdate = warningData.filter((x: any) => x.ispopupmessageremoved === true);
      if (dataToUpdate.length > 0) {
        await Promise.all(
          dataToUpdate.map((item: any) => 
            UpdateValidationWarningLogsMutation({
              variables: {
                formfieldId: item?.formfieldid,
                invitationId,
              },
            })
          )
        );
      }
    }
    removeWarning();
  }, [UpdateValidationWarningLogsMutation, invitationId, removeWarning]);

  const nextQuestion = useCallback(async (e?: any) => {
    scrollToTop();
    if (isLast) return;

    const warningData = useWarningMessageStore.getState().WarningRuleFields;
    
    if (query?.mode === FormMode.Start) {
      if (warningData[0]?.isWarningRule) {
        setLoading(false);
        if (warningData[0]?.isFileUpload) {
          postParentMessage(raraAlertPopup(warningData[0]?.warningmessage || '', "next"));
        } else {
          postParentMessage(warpWarningmessage(warningData[0]?.warningmessage || '', "next"));
        }
        return false;
      } else {
        await handleWarningRemoval(warningData);
        await upsertQuestionAnswer(activeTab);
        nextHandler();
      }
    } else {
      nextHandler();
    }
  }, [
    activeTab,
    handleWarningRemoval,
    isLast,
    nextHandler,
    postParentMessage,
    query?.mode,
    raraAlertPopup,
    scrollToTop,
    setLoading,
    upsertQuestionAnswer,
    warpWarningmessage,
  ]);

  const previousQuestion = useCallback(async (e?: any) => {
    scrollToTop();
    if (isFirst) return;

    const warningData = useWarningMessageStore.getState().WarningRuleFields;
    
    if (query?.mode === FormMode.Start) {
      if (warningData[0]?.isWarningRule) {
        setLoading(false);
        if (warningData[0]?.isFileUpload) {
          postParentMessage(raraAlertPopup(warningData[0]?.warningmessage || '', "prev"));
        } else {
          postParentMessage(warpWarningmessage(warningData[0]?.warningmessage || '', "prev"));
        }
        return false;
      } else {
        await handleWarningRemoval(warningData);
        await upsertQuestionAnswer(activeTab);
        prevHandler();
      }
    } else {
      prevHandler();
    }
  }, [
    activeTab,
    handleWarningRemoval,
    isFirst,
    postParentMessage,
    prevHandler,
    query?.mode,
    raraAlertPopup,
    scrollToTop,
    setLoading,
    upsertQuestionAnswer,
    warpWarningmessage,
  ]);

  return {
    nextQuestion,
    previousQuestion,
    scrollToTop,
  };
};
