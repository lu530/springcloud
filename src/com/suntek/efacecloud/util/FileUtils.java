package com.suntek.efacecloud.util;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * 
 */
public class FileUtils {
    
    /**
     * 创建目录
     *
     * @param dir
     */
    public static void mkdirs(String dir) {
        File f = new File(dir);
        mkdirs(f);
    }
    
    /**
     * 创建目录
     *
     * @param f
     */
    public static void mkdirs(File f) {
        if (!f.exists()) {
            if (f.isFile()) {
                mkdirs(f.getParentFile());
            } else if (f.isDirectory()) {
                f.mkdirs();
            } else {
                f.mkdirs();
            }
        }
    }
    
    public static void forceDelete(File file) throws IOException {
        if (file.isDirectory()) {
            deleteDirectory(file);
        } else {
            boolean filePresent = file.exists();
            if (!(file.delete())) {
                if (!(filePresent)) {
                    throw new FileNotFoundException("File does not exist: "
                            + file);
                }
                String message = "Unable to delete file: " + file;
                
                throw new IOException(message);
            }
        }
    }
    
    public static void deleteDirectory(File directory) throws IOException {
        if (!(directory.exists())) {
            return;
        }
        
        cleanDirectory(directory);
        if (!(directory.delete())) {
            String message = "Unable to delete directory " + directory + ".";
            
            throw new IOException(message);
        }
    }
    
    public static void cleanDirectory(File directory) throws IOException {
        if (!(directory.exists())) {
            String message = directory + " does not exist";
            throw new IllegalArgumentException(message);
        }
        
        if (!(directory.isDirectory())) {
            String message = directory + " is not a directory";
            throw new IllegalArgumentException(message);
        }
        
        File[] files = directory.listFiles();
        if (files == null) {
            throw new IOException("Failed to list contents of " + directory);
        }
        
        IOException exception = null;
        for (int i = 0; i < files.length; ++i) {
            File file = files[i];
            try {
                forceDelete(file);
            } catch (IOException ioe) {
                exception = ioe;
            }
        }
        
        if (null != exception){
            throw exception;
        }
    }
}
