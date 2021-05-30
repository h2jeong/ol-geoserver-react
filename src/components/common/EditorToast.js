import React from 'react';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';

const EditorToast = ({ initialValue, height = 'auto', editorRef }) => {
  return (
    <Editor
      initialValue={initialValue}
      initialEditType="wysiwyg"
      previewStyle="vertical"
      height={height}
      useCommandShortcut={true}
      ref={editorRef}
    />
  );
};

export default EditorToast;
