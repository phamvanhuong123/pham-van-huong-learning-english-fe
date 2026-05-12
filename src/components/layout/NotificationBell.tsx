import { BellIcon } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { notificationApi } from "@/services/notificationApi"
import { toRelativeTime } from "@/utils/relativeTime"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const queryClient = useQueryClient()

  // Polling mỗi 60 giây — KHÔNG dùng WebSocket
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getList(1, 10),
    refetchInterval: 60_000, // 60 giây
    refetchIntervalInBackground: false, // chỉ poll khi tab active
  })

  const notifications = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  // Mutation: Đánh dấu tất cả là đã đọc
  const readAllMutation = useMutation({
    mutationFn: notificationApi.readAll,
    onSuccess: () => {
      // Optimistic Update: reset unreadCount và set isRead = true
      queryClient.setQueryData(["notifications"], (old: any) =>
        old
          ? {
              ...old,
              unreadCount: 0,
              notifications: old.notifications.map((n: any) => ({
                ...n,
                isRead: true,
              })),
            }
          : old
      )
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (open && unreadCount > 0) {
      readAllMutation.mutate()
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="text-sm font-semibold">Thông báo</h3>
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-1 border-b p-4 last:border-0 hover:bg-muted/50 transition-colors",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.body}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {toRelativeTime(notification.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4">
              <BellIcon className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Chưa có thông báo nào</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
