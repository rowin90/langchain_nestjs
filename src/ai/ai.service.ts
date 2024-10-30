import { Injectable } from '@nestjs/common';
import { GlmModelProvider } from './model/glm';
import { RunnableConfig } from '@langchain/core/runnables';
import { extractCodeBlocks } from './utils';

@Injectable()
export class AiService {
  async buildGeneratePrompt({ message }: { message: string }) {
    const codePrompt = `
    You are a low-code component development expert.
    Your task is to help me generate two files for a low-code development module: index.jsx and config.js.
    The index.jsx file should define the structure of the component using React and Ant Design, and the config.js file should specify the component's property configurations.

    Here’s an example of a login form component:

    index.jsx file:
    // jsx
    export default ({ id, type, config, onClick }, ref) => {
        const { Form, Button, Input } = window.antd;
        const onFinish = (values) => {
          onClick && onClick(values);
        }
        return (
          <div data-id={id} data-type={type}>
            <Form name="login"
              labelCol={{ span: config.props.labelCol }}
              wrapperCol={{ span: config.props.wrapperCol }}
              style={{ maxWidth: config.props.maxWidth }}
              onFinish={onFinish}
            >
              <Form.Item label="用户名" name="username">
                <Input />
              </Form.Item>
              <Form.Item label="密码" name="password">
                <Input.Password />
              </Form.Item>
              <Form.Item wrapperCol={{
                offset: config.props.offset,
                span: config.props.wrapperCol
              }}>
                <Button htmlType="submit" block={config.props.block} type="primary">
                  {config.props.loginBtn}
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
      };

      config.js file:
      // config.js
        export default {
            attrs: [
                {
                type: 'Title',
                label: '基础设置',
                key: 'basic'
                },
                {
                type: 'Input',
                label: '登陆名称',
                name: ['loginBtn']
                },
                {
                type: 'Switch',
                label: '块状按钮',
                name: ['block']
                },
                {
                type: 'InputNumber',
                label: 'LabelCol',
                name: ['labelCol']
                },
                {
                type: 'InputNumber',
                label: 'WrapperCol',
                name: ['wrapperCol']
                },
                {
                type: 'InputNumber',
                label: 'Offset',
                name: ['offset']
                },
                {
                type: 'InputNumber',
                label: 'MaxWidth',
                name: ['maxWidth']
                }
            ],
            config: {
                props: {
                loginBtn: '登陆',
                block: true,
                labelCol: 8,
                wrapperCol: 16,
                offset: 8,
                maxWidth: 700
                },
                style: {},
                events: [],
            },
            events: [
                {
                value: 'onClick',
                name: '登陆事件'
                }
            ],
            methods: [],
        };
        Note: If you need to import hooks like useState and useEffect, you should import them using const { useState, useEffect } = window.React;. 
        Similarly, Ant Design components should be imported in this way: const { Button, Form, DatePicker, Tag } = window.antd;.
        Now, based on the above structure and configuration, I need you to generate the index.jsx and config.js files for a new component. 
        The description of this component in Chinese is #{message}. You can understand it in English and help me implement the code of the component
        Please return only the code for both files, without any additional description text or markdown syntax.
    `;

    const prompt = codePrompt.replace('#{message}', message);
    return prompt;
  }

  async codeGenerate(message: string): Promise<Array<string>> {
    const modelProvider = new GlmModelProvider();

    const aiRunnableAbortController = new AbortController();
    const aiRunnable = await modelProvider.createRunnable({
      signal: aiRunnableAbortController.signal,
    });

    const sessionId = `code_session_${Date.now()}`;

    const aiRunnableConfig: RunnableConfig = {
      configurable: {
        sessionId,
      },
    };

    const sessionIdHistoriesMap = await GlmModelProvider.sessionIdHistoriesMap;

    const isSessionHistoryExists = !!sessionIdHistoriesMap[sessionId];

    const prompt = await this.buildGeneratePrompt({ message });

    const buildStream = async () => {
      let aiStream = null;
      if (!isSessionHistoryExists) {
        delete sessionIdHistoriesMap[sessionId];
        aiStream = aiRunnable.stream(
          {
            input: prompt,
          },
          aiRunnableConfig,
        );
      } else {
        aiStream = aiRunnable.stream(
          {
            input: `
                          continue, please do not reply with any text other than the code, and do not use markdown syntax.
                          go continue.
                      `,
          },
          aiRunnableConfig,
        );
      }
      return aiStream;
    };

    const result = [];
    const aiStream = await buildStream();
    if (aiStream) {
      for await (const chunk of aiStream) {
        const text = GlmModelProvider.answerContentToText(chunk.content);
        result.push(text);
      }
    }
    const ai_stream_string = result.join('');
    const code_array = extractCodeBlocks(ai_stream_string);

    return [code_array[0], code_array[1]];
  }
}
