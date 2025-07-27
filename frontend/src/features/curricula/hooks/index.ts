/**
 * Curricula hooks
 */

export * from './useCurricula';

// Re-export all curricula-related hooks
export {
  CURRICULA_QUERY_KEYS,
  useCurricula,
  useCurriculaStats,
  useCurriculum,
  useCurriculaByCourse,
  useCurriculumTree,
  useCreateCurriculum,
  useUpdateCurriculum,
  useDeleteCurriculum,
  useDuplicateCurriculum,
  useBulkMoveCurricula,
  useBulkUpdateCurriculumStatus,
  useReorderCurricula,
  useCurriculaManagement,
  useSetDefaultCurriculum,
  useRemoveDefaultCurriculum,
  useDefaultCurriculaByCourse,
  useLevelsByCurriculum,
  useCreateLevel,
  useUpdateLevel,
  useDeleteLevel,
  useSaveCurriculumStructure
} from './useCurricula';