import { Message } from "../../types/Messages";
import { disableAllButtons } from "./embed";
import { respond } from "./helpers";

export async function ignore(message: Message | undefined): Promise<Response> {
	if (message) await disableAllButtons(message);

	return respond({
		type: 4,
		data: {
			content: ":thumbsup: Ignoring this deploy",
		},
	});
}
