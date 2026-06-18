import { getSdkInstance } from '@/graphql/server/sdk';
import { UserPagesPermissionVM } from '@/types/interface.types';

export const getMappedPagesDetail = async (userGuid: string): Promise<UserPagesPermissionVM[]> => {
    try {
        const sdk = await getSdkInstance();
        const result = await sdk.GetMappedPagesDetailByGuid({
            userGuid
        });

        const pages = result.Tbl_Pages || [];
        return pages.map(page => ({
            pageGuid: page.PageGuid || '',
            pageName: page.PageKey || '',
            pageUrl: page.URL || null
        }));
    } catch (error) {
        throw new Error('Failed to fetch mapped pages details');
    }
};