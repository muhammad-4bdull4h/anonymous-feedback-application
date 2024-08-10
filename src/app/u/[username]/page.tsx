"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

function page() {
  const { username } = useParams();
  const [loader, setLoader] = useState(false);
  const [seggestedMessages, setSuggestedMessages] = useState(
    "What's your favorite movie?||Do you have any pets?||What's your dream job?"
  );

  const suggestedMessagesParser = (messageString: string): string[] => {
    return messageString.split("||");
  };

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const fetechSuggestedMessages = async () => {
    // fetch suggested messages from server
    try {
      const res = await axios.get("/api/suggest-message");
      console.log(res);
      if (res.data.success) {
        setSuggestedMessages(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const messageContent = form.watch("content");

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    // send message to server
    try {
      setLoader(true);
      const res = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      if (res.data?.success) {
        toast({
          title: "Message sent successfully",
        });
      }
      form.reset({ ...form, content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: axiosError.message,
        variant: "destructive",
      });
    } finally {
      setLoader(false);
    }
  };
  return (
    <div className="">
      <h1 className="text-center text-3xl font-bold mt-10 p-2">
        Public profile link
      </h1>
      <section className="w-[90vw] mx-auto sm:w-[70vw]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Send Anonymous messages to @{username}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your text here"
                      className="resize none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              {loader ? (
                <Button className="mt-10 " disabled>
                  {" "}
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait{" "}
                </Button>
              ) : (
                <Button
                  className="mt-10 "
                  type="submit"
                  disabled={loader || !messageContent}
                >
                  Send
                </Button>
              )}
            </div>
          </form>
        </Form>
      </section>
    </div>
  );
}

export default page;
