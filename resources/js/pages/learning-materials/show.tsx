import { Head, Link, router } from '@inertiajs/react';
import {
    Check,
    Copy,
    Edit3,
    ExternalLink,
    FileText,
    FileVideo,
    Headphones,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useClipboard } from '@/hooks/use-clipboard';

import { materialsPath } from './create';
import type { LearningMaterialFormValue, MaterialType } from './create';

type LearningMaterialDetail = LearningMaterialFormValue & {
    disk: string;
    path: string;
    mime_type: string | null;
    created_at_formatted: string | null;
    updated_at_formatted: string | null;
    published_at_formatted: string | null;
};

type Props = {
    material: LearningMaterialDetail;
};

function typeIcon(type: MaterialType) {
    if (type === 'video') {
        return <FileVideo className="size-7" />;
    }

    if (type === 'audiobook') {
        return <Headphones className="size-7" />;
    }

    return <FileText className="size-7" />;
}

function DetailItem({
    label,
    value,
    className = '',
}: {
    label: string;
    value?: string | null;
    className?: string;
}) {
    return (
        <div
            className={`grid gap-1 rounded-lg border bg-muted/20 p-4 ${className}`}
        >
            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>
            <span className="text-sm font-medium break-words">
                {value || 'N/A'}
            </span>
        </div>
    );
}

export default function ShowLearningMaterial({ material }: Props) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [copiedPath, copyPath] = useClipboard();
    const pathCopied = copiedPath === material.path;

    return (
        <>
            <Head title={material.title} />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold tracking-normal break-words">
                            {material.title}
                        </h1>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                                    {typeIcon(material.type)}
                                </span>
                                <div className="min-w-0">
                                    <CardTitle className="leading-tight break-words">
                                        {material.original_name}
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                                <DetailItem
                                    label="Description"
                                    value={
                                        material.description ||
                                        'No description added.'
                                    }
                                    className="md:col-span-2"
                                />
                                <DetailItem
                                    label="Category"
                                    value={material.category?.name}
                                />
                                <DetailItem
                                    label="File size"
                                    value={material.size_formatted}
                                />
                                <DetailItem
                                    label="Storage disk"
                                    value={material.disk}
                                />
                                <DetailItem
                                    label="MIME type"
                                    value={material.mime_type}
                                />
                                <DetailItem
                                    label="Created"
                                    value={material.created_at_formatted}
                                />
                                <DetailItem
                                    label="Updated"
                                    value={material.updated_at_formatted}
                                />
                                <DetailItem
                                    label="Published"
                                    value={material.published_at_formatted}
                                />
                                <DetailItem
                                    label="Extension"
                                    value={material.extension}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="self-start rounded-lg">
                        <CardHeader>
                            <CardTitle>Storage</CardTitle>
                            <CardDescription>
                                Where this file is stored.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 rounded-lg border bg-muted/20 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Object path
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2"
                                        onClick={() =>
                                            void copyPath(material.path)
                                        }
                                    >
                                        {pathCopied ? (
                                            <Check className="size-3.5" />
                                        ) : (
                                            <Copy className="size-3.5" />
                                        )}
                                        {pathCopied ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>

                                <p className="rounded-md bg-background px-3 py-2 font-mono text-xs break-all text-muted-foreground">
                                    {material.path}
                                </p>
                            </div>

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Trash2 className="size-4" />
                                Delete material
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" asChild>
                        <Link href={materialsPath}>Back</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <a
                            href={material.preview_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <ExternalLink className="size-4" />
                            Open file
                        </a>
                    </Button>
                    <Button asChild>
                        <Link href={`${materialsPath}/${material.id}/edit`}>
                            <Edit3 className="size-4" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete learning material</DialogTitle>
                        <DialogDescription>
                            This will permanently delete{' '}
                            <span className="font-medium text-foreground">
                                {material.title}
                            </span>{' '}
                            and remove its uploaded file from storage. This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                router.delete(
                                    `${materialsPath}/${material.id}`,
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => setDeleteOpen(false),
                                    },
                                );
                            }}
                        >
                            <Trash2 className="size-4" />
                            Delete material
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ShowLearningMaterial.layout = {
    breadcrumbs: [
        {
            title: 'Learning Materials',
            href: materialsPath,
        },
        {
            title: 'View Material',
            href: materialsPath,
        },
    ],
};
