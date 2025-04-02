# langchain 

RAG使用的是 ollama 提供的 Embedding 模型，需要打开
1. 启动 ollama，使用 http://localhost:11434
2. model可以使用的方法，invoke，stream等

# langchain 
- 在 src/study_xxxx.tsx 文件
- 可以执行 pnpm repl:dev 用REPL模式进行对应的调用

## faiss_index
- 这里是预设的一些本地向量

## doc
- 这里是一些不同格式的文件，用于 rag 中的各种文档加载器


# langgraph
- 在 graph 文件夹下
- 直接 tsx .graph/langgraph.tsx

# mcp
- 在 mcp 文件夹下
- 注意需要修改 package.json 文件中的 type 为 module
` Top-level await is currently not supported with the "cjs" output format`
- 然后运行 tsx  ./mcp/mcp.client.ts 即可
