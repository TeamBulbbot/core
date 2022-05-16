/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// https://gist.github.com/devsnek/77275f6e3f810a9545440931ed314dc1

const hexLookup = {
	0: 0x0,
	1: 0x1,
	2: 0x2,
	3: 0x3,
	4: 0x4,
	5: 0x5,
	6: 0x6,
	7: 0x7,
	8: 0x8,
	9: 0x9,
	A: 0xa,
	B: 0xb,
	C: 0xc,
	D: 0xd,
	E: 0xe,
	F: 0xf,

	// Lowercase
	a: 0xa,
	b: 0xb,
	c: 0xc,
	d: 0xd,
	e: 0xe,
	f: 0xf,
}

const hex2bin = (hex: string) => Uint8Array.from(hex, (character) => hexLookup[character])

const PUBLIC_KEY = crypto.subtle.importKey(
	"raw",
	hex2bin(DISCORD_PUBLIC_KEY),
	{
		name: "NODE-ED25519",
		namedCurve: "NODE-ED25519",
	},
	true,
	["verify"],
);

const encoder = new TextEncoder();

export async function verify(request: Request) {
	const signature = hex2bin(request.headers.get("X-Signature-Ed25519")!);
	const timestamp = request.headers.get("X-Signature-Timestamp");
	const unknown = await request.clone().text();

	return await crypto.subtle.verify("NODE-ED25519", await PUBLIC_KEY, signature, encoder.encode(timestamp + unknown));
}
