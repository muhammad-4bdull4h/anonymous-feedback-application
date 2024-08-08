import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { Message } from "@/models/user.model";

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.isAcceptingMessge) {
      return Response.json(
        {
          success: false,
          message: "user is not accepting the messages",
        },
        {
          status: 403,
        }
      );
    }

    const newMessage = { content, createdAt: new Date() };

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      { success: true, message: "message sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("error while sending message", error);
    return Response.json(
      {
        success: false,
        message: "error while sending message",
      },
      {
        status: 500,
      }
    );
  }
}
