import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe } from "../api/me";

export const meKeys = { all: ["me"] };

// 내 정보 조회
export function useMe() {
  return useQuery({
    queryKey: meKeys.all,
    queryFn: getMe,
  });
}

// 내 정보 수정
export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedMe) => {
      // 서버가 돌려준 최신 정보로 캐시를 바로 바꿔서 다시 요청하지 않아도 화면이 바뀐다
      queryClient.setQueryData(meKeys.all, updatedMe);
      // 연령대·성별이 바뀌면 맞는 광고도 달라지므로 배너를 다시 매칭한다
      queryClient.invalidateQueries({ queryKey: ["banner", "match"] });
    },
  });
}
