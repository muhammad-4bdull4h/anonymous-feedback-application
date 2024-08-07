import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    // validate with zod

    const result = UsernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const userNameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            userNameErrors?.length > 0
              ? userNameErrors.join(", ")
              : "invalid query parameters",
        },
        {
          status: 400,
        }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "username already taken",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "username is availaible",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("error while checking username", error);
    return Response.json(
      {
        success: false,
        message: "error while checking username",
      },
      {
        status: 500,
      }
    );
  }
}
