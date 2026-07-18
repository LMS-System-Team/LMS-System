import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

export type ProgramFormRecord = {
    id: number;
    name: string;
    code: string;
    faculty_id: string;
};

type Option = { value: string; label: string };

export function ProgramFormDialog({
    program,
    facultyOptions,
    defaultFacultyId,
    onClose,
}: {
    program: ProgramFormRecord | null;
    facultyOptions: Option[];
    defaultFacultyId?: string;
    onClose: () => void;
}) {
    const isEdit = program !== null;
    const { data, setData, errors, processing, post, put } = useForm({
        name: program?.name ?? '',
        code: program?.code ?? '',
        faculty_id: program?.faculty_id ?? defaultFacultyId ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = { preserveScroll: true, onSuccess: onClose };

        if (program) {
            put(`/academic/programs/${program.id}`, options);

            return;
        }

        post('/academic/programs', options);
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={submit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>
                            {isEdit ? 'Edit program' : 'Create program'}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the program information and select its
                            faculty.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="program-name">Program name</Label>
                            <Input
                                id="program-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Bachelor of Information Technology"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="program-code">Code</Label>
                                <Input
                                    id="program-code"
                                    value={data.code}
                                    onChange={(event) =>
                                        setData('code', event.target.value)
                                    }
                                    placeholder="BIT"
                                />
                                {errors.code && (
                                    <p className="text-sm text-destructive">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="program-faculty">Faculty</Label>
                                <Select
                                    value={data.faculty_id}
                                    onValueChange={(value) =>
                                        setData('faculty_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="program-faculty"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select faculty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facultyOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.faculty_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.faculty_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Save className="size-4" />
                            )}
                            {isEdit ? 'Save changes' : 'Create program'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
