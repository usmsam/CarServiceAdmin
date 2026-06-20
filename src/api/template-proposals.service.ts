import api from './axios.instance';
import type { ServiceStation } from './stations.service';
import type { TemplateCategory, TemplateItem } from './templates.service';
import type { AdminUser } from './users.service';

export type TemplateProposalType = 'category' | 'service';
export type TemplateProposalStatus = 'new' | 'approved' | 'rejected' | 'merged';

export interface TemplateProposal {
  _id: string;
  type: TemplateProposalType;
  stationId: string | ServiceStation;
  ownerId: string | AdminUser;
  query: string;
  titleRu?: string;
  titleUz?: string;
  categoryQuery?: string;
  comment?: string;
  status: TemplateProposalStatus;
  approvedTemplateCategoryId?: string | TemplateCategory;
  approvedTemplateItemId?: string | TemplateItem;
  adminComment?: string;
  resolvedBy?: string | AdminUser;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const TemplateProposalsService = {
  getProposals: async (filters?: {
    status?: TemplateProposalStatus;
    type?: TemplateProposalType;
    stationId?: string;
  }): Promise<TemplateProposal[]> => {
    const { data } = await api.get('/backoffice/template-proposals', {
      params: filters,
    });
    return data;
  },

  approveCategory: async (
    id: string,
    payload: {
      templateCategoryId?: string;
      name?: string;
      nameRu?: string;
      nameUz?: string;
      segment?: string;
      order?: number;
      adminComment?: string;
    },
  ): Promise<TemplateProposal> => {
    const { data } = await api.post(
      `/backoffice/template-proposals/${id}/approve-category`,
      payload,
    );
    return data;
  },

  approveService: async (
    id: string,
    payload: {
      templateCategoryId: string;
      templateItemId?: string;
      title?: string;
      titleRu?: string;
      titleUz?: string;
      aliasesRu?: string[];
      aliasesUz?: string[];
      defaultPrice?: number;
      defaultReminderRuleId?: string;
      adminComment?: string;
    },
  ): Promise<TemplateProposal> => {
    const { data } = await api.post(
      `/backoffice/template-proposals/${id}/approve-service`,
      payload,
    );
    return data;
  },

  merge: async (
    id: string,
    payload: {
      templateCategoryId?: string;
      templateItemId?: string;
      adminComment?: string;
    },
  ): Promise<TemplateProposal> => {
    const { data } = await api.post(`/backoffice/template-proposals/${id}/merge`, payload);
    return data;
  },

  reject: async (
    id: string,
    payload?: { adminComment?: string },
  ): Promise<TemplateProposal> => {
    const { data } = await api.post(
      `/backoffice/template-proposals/${id}/reject`,
      payload || {},
    );
    return data;
  },
};
