import { useState } from 'react';

import { trpc } from '@/app/_trpc/client';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { default as MDEditor } from '@uiw/react-md-editor';
import { Edit, TrashIcon } from 'lucide-react';
import { default as toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface TestCase {
  input: string;
  output: string;
}

export const TestCase = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isedited, setIsEdited] = useState(false);
  const [editingIndex, setEditingIndex] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data } = trpc.testcase.getById.useQuery(id);

  // setTestCases(data)
  console.log(data);
  const createTestCase = trpc.testcase.create.useMutation({
    onSuccess: async () => {
      toast.success('Test case added successfully');
      await utils.testcase.getById.invalidate(id);
      console.log('createTestCase onSuccess');
    },
  });
  const updateTestCase = trpc.testcase.update.useMutation({
    onSuccess: async () => {
      toast.success('Test case updated successfully');
      await utils.testcase.getById.invalidate(id);
      console.log('updateTestCase onSuccess');
    },
  });

  const deleteTestCase = trpc.testcase.remove.useMutation({
    onSuccess: async () => {
      toast.success('Test case deleted successfully');
      await utils.testcase.getById.invalidate(id);
      console.log('deleteTestCase onSuccess');
    },
  });

  const toggleHidden = trpc.testcase.toggleHidden.useMutation({
    onSuccess: async () => {
      toast.success('Test case hidden/unhidden successfully');
      await utils.testcase.getById.invalidate(id);
      console.log('toggleHidden onSuccess');
    },
  });

  const handleToggle = (id: string, isHidden: boolean) => {
    console.log(id, isHidden);
    toggleHidden.mutate({
      id,
      isHidden: !isHidden,
    });
  };

  const handleAdd = () => {
    setOpen(true);
  };

  const handleClose = () => {
    if (isedited) {
      setInput('');
      setOutput('');
    }
    setOpen(false);
    setIsEdited(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!input.trim() || !output.trim()) {
      toast.error('Both input and output fields are required');
      return;
    }

    console.log(input, output);

    if (isedited) {
      // console.log('edit', editingIndex)
      updateTestCase.mutate({
        input: {
          id: editingIndex!,
          input,
          output,
        },
      });
    } else {
      createTestCase.mutate({
        input: {
          input,
          output,
          problemId: id,
        },
      });
    }
    setInput('');
    setOutput('');
    handleClose();
  };

  const handleEdit = (index: string, input: string, output: string) => {
    //dialog will open
    // console.log('edit', index)
    // console.log(testCases[index])
    setIsEdited(true);
    setEditingIndex(index);
    setInput(input);
    setOutput(output);
    setOpen(true);
  };

  const handleDelete = (index: string) => {
    deleteTestCase.mutate(index);
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Test Case</h1>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={handleAdd}>
          Add Test Case
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="space-y-4">
          <DialogTitle className="text-xl font-semibold">Add Test</DialogTitle>
          <Textarea
            placeholder="Enter input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded border p-2"
          />
          <Textarea
            placeholder="Enter output"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="w-full rounded border p-2"
          />
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              onClick={handleClose}
              className="rounded bg-gray-300 px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded bg-blue-500 px-4 py-2 text-black"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ul className="space-y-4">
        {data?.map((testCase, index) => (
          <li key={index} className="border rounded p-4 relative">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Test Case {index + 1}</p>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  className="w-14 h-7"
                  onClick={() => {
                    handleToggle(testCase.id, testCase.isHidden);
                  }}
                >
                  {testCase.isHidden ? (
                    <span className="text-green-500">unhide</span>
                  ) : (
                    <span className="text-red-500">Hide</span>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() =>
                    handleEdit(testCase.id, testCase.input!, testCase.output!)
                  }
                  className="text-white px-2 py-1 rounded hover:bg-blue-500"
                >
                  <Edit className="w-5 h-5 text-blue-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(testCase.id)}
                  className=" text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  <TrashIcon className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
            <div>
              <p className="font-semibold">Input:</p>
              <MDEditor.Markdown
                source={testCase.input!}
                className="!bg-transparent font-semibold"
                style={{ whiteSpace: 'pre-wrap' }}
              />
              <p className="font-semibold mt-2">Output:</p>
              <p>{testCase.output}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestCase;
