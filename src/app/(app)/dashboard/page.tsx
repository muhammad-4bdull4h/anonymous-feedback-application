"use client";
import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Message } from "@/models/user.model";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwithLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(
      messages.filter((message) => {
        return message._id !== messageId;
      })
    );
  };

  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwithLoading(true);
    try {
      const res = await axios.get<ApiResponse>(`/api/accept-message`);

      setValue("acceptMessages", res.data.isAcceptingMessages);
    } catch (error) {
      console.log(error);

      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "failed to fetch is accepting messages",
        variant: "destructive",
      });
    } finally {
      setIsSwithLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwithLoading(false);
      try {
        const res = await axios.get<ApiResponse>("/api/get-messages");
        if (res.data.success) {
          setMessages(res.data.messages || []);
          if (refresh) {
            toast({
              title: "Messages refreshed",
              description: "Showing latest messages",
            });
          }
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data.message || "failed to fetch messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();
    fetchAcceptMessage();
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);

  //handle swithch change
  const handleSwitchChange = async () => {
    try {
      const res = await axios.post("/api/accept-message", {
        acceptMessage: !acceptMessages,
      });

      setValue("acceptMessages", !acceptMessages);
      if (res.data.success) {
        toast({
          title: "status changed",
          description: "status changed successfully",
        });
      }
    } catch (error) {
      console.log(error);

      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "failed to change statusJJJjj",
        variant: "destructive",
      });
    }
  };

  const [profileUrl, setProfileUrl] = useState("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const username = session?.user?.username;
  useEffect(() => {
    if (typeof window !== "undefined") {
      const basrUrl = `${window?.location.protocol}//${window?.location.host}`;
      const profileUrl = `${basrUrl}/u/${username}`;
      setProfileUrl(profileUrl);
    }
  }, [username]);

  if (!session || !session.user) {
    return <div>Please Login</div>;
  }

  return (
    <div>
      <div className="my-8 sm:mx-4 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
          <div className="flex items-center">
            <input
              type="text"
              value={profileUrl}
              disabled
              className="input input-bordered w-full p-2 mr-2"
            />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>

        <div className="mb-4">
          <Switch
            {...register("acceptMessages")}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="ml-2">
            Accept Messages: {acceptMessages ? "On" : "Off"}
          </span>
        </div>
        <Separator />

        <Button
          className="mt-4"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <MessageCard
                key={message?._id as string}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p>No messages to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
