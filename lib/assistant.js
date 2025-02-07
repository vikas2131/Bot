const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class Assistant {

    constructor(instructions, options = {}) {
        this.instructions = instructions;
        this.systemPrompt = options.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
        this.tools = options.canHangUp === false ? TOOLS_NONE : TOOL_HANG_UP; // NOTE: only tool supported right now is hang-up
        this.speakFirst = options.speakFirst ?? true;
        this.speakFirstOpeningMessage = options.speakFirstOpeningMessage;
        this.llmModel = options.llmModel ?? "gpt-3.5-turbo";
        this.voiceModel = options.voiceModel ?? "openai/tts-1";
        this.voiceName = options.voiceName ?? "shimmer";
        this.speechToTextModel = options.speechToTextModel ?? "openai/whisper-1";
        this.tts = new TextToSpeech(this.voiceModel, this.voiceName);
    }

    _assemblePrompt(systemPrompt, providedInstructions, tools) {
        let instructionPrompt = INSTRUCTION_PROMPT_BASE;
        instructionPrompt = instructionPrompt.replace(
            "{instructions}",
            providedInstructions
        );
        instructionPrompt = instructionPrompt.replace("{tools}", tools);

        const prompt = [
            {
            role: "system",
            content: systemPrompt,
            },
            {
            role: "user",
            content: instructionPrompt,
            },
        ];

        return prompt;
    }

    get prompt() {
        return this._assemblePrompt(
            this.systemPrompt,
            this.instructions,
            this.tools
        );
    }

    async createResponse(conversation) {
        let selectedTool = undefined;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: conversation,
        });

        let content = response.choices[0].message.content;

        return {
            content,
            selectedTool,
            };
    }

    createConversation(ws, options={}) {
        options.speechToTextModel = this.speechToTextModel;
        return new CallConversation(this, ws, options);
    }
}

// ----- Prompting ------

const DEFAULT_SYSTEM_PROMPT =
 `You are a delightful AI upsc exam tutor agent. 
  Please be polite but concise.
  Show a bit of personality.
  Please respond with an answer that is going to be transcribed well and add uhs, ums, mhms, and other disfluencies as needed to keep it casual.
  The dialogue is transcribed and might be a bit wrong if the speech to text is bad. 
  Don't be afraid to ask to clarify if you don't understand what the student said because you may have misheard.`;

const INSTRUCTION_PROMPT_BASE = `
INSTRUCTIONS
{instructions}

TOOLS
{tools}
`;

const TOOLS_NONE = "N/A";

exports.Assistant = Assistant;