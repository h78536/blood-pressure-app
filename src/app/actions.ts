
'use server';

// The AI functionality has been temporarily disabled to resolve a build issue.
// We will restore this feature in a future step.

export async function askMedicalQuestion(question: string, readingsContext: string): Promise<string> {
  console.log("AI function called with:", question);
  return "抱歉，AI 助手功能正在维护中，暂时无法回答您的问题。";
}
