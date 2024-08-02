import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Download, Upload } from "lucide-react";

const CSVEditor = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n');
      const headers = rows[0].split(',');
      const parsedData = rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });

      setHeaders(headers);
      setData(parsedData);
    };

    reader.readAsText(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleEdit = (index, header, value) => {
    const newData = [...data];
    newData[index][header] = value;
    setData(newData);
  };

  const handleAddRow = () => {
    const newRow = headers.reduce((obj, header) => {
      obj[header] = '';
      return obj;
    }, {});
    setData([...data, newRow]);
  };

  const handleDeleteRow = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const handleDownload = () => {
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'edited_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CSV Editor</h1>
      
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 cursor-pointer">
        <input {...getInputProps()} />
        <p className="text-center">Drag & drop a CSV file here, or click to select one</p>
      </div>

      {data.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map(header => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    {headers.map(header => (
                      <TableCell key={header}>
                        <Input
                          value={row[header]}
                          onChange={(e) => handleEdit(index, header, e.target.value)}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteRow(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-between">
            <Button onClick={handleAddRow}>
              <Plus className="h-4 w-4 mr-2" /> Add Row
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download CSV
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CSVEditor;
