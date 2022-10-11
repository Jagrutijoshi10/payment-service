# rename docker file
sed -i 's/staging/stage1/g;s/stage2/stage1/g;s/stage3/stage1/g;s/stage4/stage1/g;' dockerfile
# generate image
docker build -t stage1_umobile_app_payment_management .
# tag image
docker tag stage1_umobile_app_payment_management asia.gcr.io/um-stage-1/stage1_umobile_app_payment_management:v$1
# push image
docker push asia.gcr.io/um-stage-1/stage1_umobile_app_payment_management:v$1