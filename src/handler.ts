import { verify } from "./verify";
import { Interaction, InteractionType } from "../types/Interaction";
import { GitHubPayload } from "../types/GitHub";
import { sendUpdateMessage } from "./utils/embed";
import { ComponentButtonStyle, ComponentType } from "../types/Messages";
import { hexToDecimal, formatHash, whoToPing, respond } from "./utils/helpers";
import { ignore } from "./utils/deploying";
import { DeveloperGitHubName } from "../types/Misc";

const RESPONSE: string[] = [
	"Hello there saw you deploy some stuff mind giving me a hand here",
	"Deploying code to master :eyes:",
	"OwO Mastew depwoy wepwoy detected! ( ﾟ∀ ﾟ)",
	"Press a button :hearth:",
	"Thanks for deploying code, now its up to me to ummm wait....",
	":hearth: Thanks for the new code",
	"CODE EATER 9000! NOHMHOHMHMMH CODE FOR MEEE",
	"Cool k thx",
];

export async function handleRequest(request: Request): Promise<Response> {
	if (!request.headers.get("X-Signature-Ed25519") || !request.headers.get("X-Signature-Timestamp")) {
		const github: GitHubPayload = await request.json();
		if (github.repository.full_name !== "TeamBulbbot/testing-repro") return Response.redirect("https://bulbbot.rocks/");
		if (github.after === github.before) return Response.redirect("https://bulbbot.rocks/");

		const description: string[] = [`New commit \`${formatHash(github.before)}\` → \`${formatHash(github.after)}\` made by **${github.pusher.name}**`, `Compare: [Link](${github.compare})`];

		if (github.commits) {
			description.push("\n");
			for (const commit of github.commits) {
				description.push(`[\`${formatHash(commit.id)}\`](${commit.url}) ${commit.message} - ${commit.author.username}`);
			}
		}

		await sendUpdateMessage(
			`${RESPONSE[Math.floor(Math.random() * RESPONSE.length)]} <@${whoToPing(github.pusher.name as DeveloperGitHubName)}>`,
			[
				{
					description: description.join("\n"),
					color: hexToDecimal("#5865F2"),
				},
			],
			[
				{
					type: 1,
					components: [
						{
							type: ComponentType.BUTTON,
							style: ComponentButtonStyle.SUCCESS,
							label: "Deploy",
							custom_id: `deploy|${github.after.substring(0, 6)}`,
						},
						{
							type: ComponentType.BUTTON,
							style: ComponentButtonStyle.DANGER,
							label: "Ignore",
							custom_id: "ignore_deploy",
						},
					],
				},
			],
		);

		return Response.redirect("https://bulbbot.rocks/");
	}
	if (!(await verify(request))) return new Response("", { status: 401 });

	const interaction: Interaction = await request.json();

	if (interaction.type === InteractionType.PING)
		return respond({
			type: InteractionType.PING,
		});

	if (!interaction.data)
		return respond({
			type: 4,
			data: {},
		});

	if (interaction.data.name === "ping")
		return respond({
			type: 4,
			data: {
				content: "Pong :ping_pong:",
			},
		});

	if (interaction.data.custom_id?.startsWith("deploy") || interaction.data.custom_id?.startsWith("ignore_deploy")) {
		if (interaction.data.custom_id?.startsWith("ignore_deploy")) return await ignore(interaction.message);
	}

	return respond({
		type: 4,
		data: {
			content: `Pressing buttons you should not press smh <@${interaction.member?.user?.id}>\nBut just because I am so nice here is the data you need\nData: \`${JSON.stringify(
				interaction.data,
			)}\`\nLocale: \`${interaction.locale}\``,
		},
	});
}
