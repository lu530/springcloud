package com.suntek.efacecloud.util;

public enum SpecialTarckLibType {
    TOPIC_ARCHIVE(1, "一人一档专题库"), BASE_ARCHIVE(2, "一人一档基础库"), DISPATCHED_DB(3, "自定义布控库");
    private int type;
    private String name;

    SpecialTarckLibType(int type, String name) {
        this.type = type;
        this.name = name;
    }

    public int getType() {
        return type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(int type) {
        this.type = type;
    }

    public static String getName(int type) {
        for (SpecialTarckLibType v : SpecialTarckLibType.values()) {
            if (v.type == type) {
                return v.name;
            }
        }
        return "未知";
    }
}
