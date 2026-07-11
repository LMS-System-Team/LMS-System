<?php

return [
    /*
    |--------------------------------------------------------------------------
    | LMS Media Storage
    |--------------------------------------------------------------------------
    |
    | Use the public disk locally. In production, set LMS_MEDIA_DISK=s3 after
    | configuring AWS credentials in config/filesystems.php / .env.
    |
    */

    'media_disk' => env('LMS_MEDIA_DISK', 'public'),
];
